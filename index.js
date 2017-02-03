"use strict"
var argv = require('minimist')(process.argv.slice(2));
const JiraApi = require('jira').JiraApi;
var reverse = require('reverse-string');



var jira;
var JIRA_URL;
var JIRA_USER;
var JIRA_PORT;
var JIRA_PASSWORD;
var JIRA_MESSAGE;
var COMMIT_MESSAGE;
var commit_message;
applyEnvironmentVariables();

createJiraConnection();

function addCommentJiraIssue(issueNumber,comment,callback){
    jira.addComment(issueNumber,comment,function(err,results){
        if (err){
            callback(err);
        } else {
            callback(null,results);
        }
    });
}

function Issue() {
    return {
        "fields": {
            "project": {
                "key": process.env.jira_default_project
            },
            "summary": "CI Build Results needing attention",
            "description": process.env.jira_build_message,
            "issuetype": {
                "name": process.env.jira_default_issue_type
            }
        }
    }
}


function findJiraIssueKeys(commit_message,callback){
    // Thanks to: https://answers.atlassian.com/questions/325865/regex-pattern-to-match-jira-issue-key
    var jira_matcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;
    //This means the string to be matched needs to be reversed ahead of time, too.
    var s = commit_message;
    s = reverse(s)
    var m = s.match(jira_matcher);

    // Also need to reverse all the results!
    if (m == null) {
     callback(null,null); 
    } else {
      for (var i = 0; i < m.length; i++) {
          m[i] = reverse(m[i])
      }
      m.reverse();
      callback(null,m);
    }
}

function isValidJiraIssue(issueNumber,callback){
    jira.findIssue(issueNumber, function(error, issue) {
        if (issue){
            callback(null,true);
        } else {
            callback(null,false);
        }
    });
};

function createJiraConnection(){
    jira = new JiraApi('https', JIRA_URL, JIRA_PORT, JIRA_USER, JIRA_PASSWORD, '2',true);
}

function applyCommandLineVariables(){
    JIRA_URL = argv.JIRA_URL;
    JIRA_PORT = argv.JIRA_PORT;
    JIRA_PASSWORD = argv.JIRA_PASSWORD;
    JIRA_USER = argv.JIRA_USER;
    COMMIT_MESSAGE = argv.COMMIT_MESSAGE;
}

function applyEnvironmentVariables(){
    if(process.env.JIRA_URL != null && process.env.JIRA_USER != null && process.env.JIRA_PASSWORD != null || process.env.JIRA_PORT){
        JIRA_URL = process.env.JIRA_URL;
        JIRA_USER = process.env.JIRA_USER;
        JIRA_PASSWORD = process.env.JIRA_PASSWORD;
        JIRA_PORT = process.env.JIRA_PORT;
    } else {
        if (typeof(argv.JIRA_URL) == 'undefined' || typeof(argv.JIRA_USER) == 'undefined' || typeof(argv.JIRA_PASSWORD) == 'undefined' || typeof(argv.JIRA_PORT)  == 'undefined') {
            console.log('Unable to setup connection to JIRA.');
            process.exit(1);
        } else {
            applyCommandLineVariables();
        }
    }
}

function processJiraIssue(issueNumber) {
    isValidJiraIssue(issueNumber,function(err,results){
        if (results){
            addCommentJiraIssue(issueNumber,process.env.jira_build_message,function(err,results){
                console.log(err,results);
            });
        }
    })
}

function createNewJiraIssue(callback){
  if (!process.env.jira_default_project || !process.env.jira_default_issue_type) {
    console.log('Default Jira Project value is missing or Jira Default issue type, unable to create new Issue');
    process.exit(1);
  } else {
    var newIssue = new Issue();
    jira.addNewIssue(newIssue,function(err,results){
        callback(err,results);
    });
  }
}

function processAllJiraIssues(issues,callback){
    if (issues !== null) {
      issues.forEach(function(issue,index){
          processJiraIssue(issue);
          if (index == issues.length) {
              callback(null);
          }
      })
    } else {
      console.log("No Jira issues found in commit to process");
      if (process.env.jira_create_failure || process.env.jira_create_missing){
        if (process.env.BITRISE_BUILD_STATUS == 1 && process.env.jira_create_failure) {
            console.log('Creating new Jira issue with details, because failure');
            createNewJiraIssue(function(err,results){
                callback(err,results);
            });
        } else if (process.env.jira_create_missing) {
            console.log('Creating new Jira issue with details, because missing');
            createNewJiraIssue(function(err,results){
                if (err){
                    process.env['JIRA_ISSUE_KEY'] = 'production';
                    callback(err,null);
                } else {
                    callback(err,results);
                }

            });
        }
      } else {
        callback(null);
      }
    }
}

if (typeof(process.env.BITRISE_GIT_MESSAGE) == 'undefined') {
    commit_message = "";
} else {
    commit_message = process.env.BITRISE_GIT_MESSAGE;
}

// Main
findJiraIssueKeys(commit_message,function(err,issues){
    processAllJiraIssues(issues,function(err){
        if (err){
            process.exit(1)
        } else {
            process.exit(0)
        }
    })
});

//jira.addComment(issueNumber,"Build results comment test");
