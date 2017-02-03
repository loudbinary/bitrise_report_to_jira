#!/bin/bash

THIS_SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${THIS_SCRIPTDIR}/_bash_utils/utils.sh"
source "${THIS_SCRIPTDIR}/_bash_utils/formatted_output.sh"

# init / cleanup the formatted output
echo "" > "${formatted_output_file_path}"

if [ -z "${git_commit_message}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `git_commit_message` not provided!'
	exit 1
fi

if [ -z "${jira_user}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `$jira_user` not provided!'
	exit 1
fi

if [ -z "${jira_password}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `$jira_password` not provided!'
	exit 1
fi

if [ -z "${jira_build_message}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `$jira_build_message` not provided!'
	exit 1
fi

if [ -z "${jira_url}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `$jira_url` not provided!'
	exit 1
fi

if [ -z "${jira_port}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `$jira_url` not provided!'
	exit 1
fi

if [ -z "${jira_default_project}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `jira_default_project` not provided!'
	exit 1
fi

if [ -z "${jira_default_issue_type}" ] ; then
	write_section_to_formatted_output "# Error"
	write_section_start_to_formatted_output '* Required input `jira_default_issue_type` not provided!'
	exit 1
fi

resp=$(npm install && node index.js --JIRA_URL="${jira_url}" --JIRA_PORT="${jira_port} --JIRA_USER="${jira_user}" --JIRA_PASSWORD="${jira_password}")

ex_code=$?

if [ ${ex_code} -eq 0 ] ; then
	echo "${resp}"
	write_section_to_formatted_output "# Success"
	echo_string_to_formatted_output "Message successfully sent."
	exit 0
fi

write_section_to_formatted_output "# Error"
write_section_to_formatted_output "Sending the message failed with the following error:"
echo_string_to_formatted_output "${resp}"
exit 1
