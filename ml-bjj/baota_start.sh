#!/bin/bash
set -e
cd /www/wwwroot/DetectSystem/api_flask
export DATABASE_URL='mysql+pymysql://detect_system:改成你的密码@127.0.0.1:13306/detect_system'
exec ./py-project-env/bin/python serving/serve.py
