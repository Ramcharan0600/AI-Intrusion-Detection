#!/bin/bash
IP=$1
sudo ufw deny from $IP to any port 2222 > /dev/null 2>&1
echo "Blocked $IP"