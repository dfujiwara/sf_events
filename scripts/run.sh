#! /bin/sh
# export the relevant env variables into a file so that it can be sourced for crontab execution.
env | grep -E '(EMAIL|PASSWORD)' | sed -e 's/\(.*\)/export \1/g' > /app/env_variables
cron && tail -f /var/log/cron.log
