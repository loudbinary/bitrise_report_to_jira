var argv = require('minimist')(process.argv.slice(2));
var JiraApi = require('jira-client');
var reverse = require('reverse-string');

var jira;
var JIRA_URL;
var JIRA_USER;
var JIRA_PASSWORD;
var JIRA_MESSAGE;
var COMMIT_MESSAGE;

applyEnvironmentVariables();

createJiraConnection();

function addCommentJiraIssue(issueNumber,comment){
    jira.addComment(issueNumber,comment);
}

function findJiraIssueKeys(commit_message,callback){
    // Thanks to: https://answers.atlassian.com/questions/325865/regex-pattern-to-match-jira-issue-key
    var jira_matcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;
    //This means the string to be matched needs to be reversed ahead of time, too.
    var s = commit_message;
    s = reverse(s)
    var m = s.match(jira_matcher);

    // Also need to reverse all the results!
    for (var i = 0; i < m.length; i++) {
        m[i] = reverse(m[i])
    }
    m.reverse();
    callback(null,m);
}

function isValidJiraIssue(issueNumber){
    jira.findIssue(issueNumber)
        .then(function(issue) {
            if (issue){
                return true;
            }
        })
        .catch(function(err) {
            console.error(err);
            return false;
        });
}

function createJiraConnection(){
    jira = new JiraApi({
        protocol: 'https',
        host: JIRA_URL,
        username: JIRA_USER,
        password: JIRA_PASSWORD,
        apiVersion: '2',
        strictSSL: true
    });

}

function applyCommandLineVariables(){
    JIRA_URL = argv.JIRA_URL;
    JIRA_PASSWORD = argv.JIRA_PASSWORD;
    JIRA_USER = argv.JIRA_USER;
}

function applyEnvironmentVariables(){
    if(process.env.JIRA_URL != null && process.env.JIRA_USER != null && process.env.JIRA_PASSWORD != null){
        JIRA_URL = process.env.JIRA_URL;
        JIRA_USER = process.env.JIRA_USER;
        JIRA_PASSWORD = process.env.JIRA_PASSWORD;
    } else {
        if (argv.JIRA_URL == null || argv.JIRA_USER == null || argv.JIRA_PASSWORD){
            throw  new Error('Unable to setup connection to JIRA.');
        } else {
            applyCommandLineVariables();
        }
    }
}

function processJiraIssue(issueNumber) {
    if (isValidJiraIssue(issueNumber) == true){
        addCommentJiraIssue(issueNumber,process.env.jira_build_message);
    }
}

function processAllJiraIssues(issues){
    issues.forEach(function(issue,index){
        processJiraIssue(issue);
        if (index == issues.length) {
            callback(null);
        }
    })
}

var commit_message = process.env.BITRISE_GIT_MESSAGE
// Main
findJiraIssueKeys(commit_message,function(err,issues){
    processAllJiraIssues(issues,function(err){
        if (err){
            process.exit(1)
        } else {
            process.exit(0)
        }
    })
})

//jira.addComment(issueNumber,"Build results comment test");
