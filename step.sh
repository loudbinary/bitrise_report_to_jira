#!/bin/bash

THIS_SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e

if [ ! -z "${workdir}" ] ; then
  echo "==> Switching to working directory: ${workdir}"
  cd "${workdir}"
  if [ $? -ne 0 ] ; then
    echo " [!] Failed to switch to working directory: ${workdir}"
    exit 1
  fi
fi

if [ -z "${git_commit_message}" ] ; then
	echo "# Error"
	echo '* Required input `git_commit_message` not provided!'
	exit 1
fi

if [ -z "${jira_user}" ] ; then
	echo "# Error"
	echo '* Required input `$jira_user` not provided!'
	exit 1
fi

if [ -z "${jira_password}" ] ; then
	echo "# Error"
	echo '* Required input `$jira_password` not provided!'
	exit 1
fi

if [ -z "${jira_build_message}" ] ; then
	echo "# Error"
	echo '* Required input `$jira_build_message` not provided!'
	exit 1
fi

if [ -z "${jira_url}" ] ; then
	echo "# Error"
	echo '* Required input `$jira_url` not provided!'
	exit 1
fi

if [ -z "${jira_port}" ] ; then
	echo "# Error"
	echo '* Required input `jira_port` not provided!'
	exit 1
fi

if [ -z "${jira_default_project}" ] ; then
	echo "# Error"
	echo '* Required input `jira_default_project` not provided!'
	exit 1
fi

if [ -z "${jira_default_issue_type}" ] ; then
	echo"# Error"
	echo '* Required input `jira_default_issue_type` not provided!'
	exit 1
fi

cd ${THIS_SCRIPTDIR}

#!/bin/bash
output=$(npm install);
echo "$output";
output=$(npm index.js);
echo "$output"
