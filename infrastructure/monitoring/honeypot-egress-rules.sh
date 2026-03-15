#!/bin/bash
# Production Egress Filtering for Honeypot Network
# Prevents compromised honeypots from pivoting to external networks or mining crypto

# Get the honeypot bridge interface (typically br-<hash>)
# You can find it with: docker network ls | grep honeypot-net
HONEYPOT_BRIDGE="br-honeypot-net"

# Drop all outgoing traffic from honeypot subnet except to internal data-net
# This assumes data-net bridge is on a specific subnet; adjust as needed
iptables -I DOCKER-USER -i ${HONEYPOT_BRIDGE} ! -o br-data-net -j DROP

# Log dropped packets for audit purposes (optional)
iptables -I DOCKER-USER -i ${HONEYPOT_BRIDGE} ! -o br-data-net -j LOG --log-prefix "HONEYPOT_DROP: "

# Persist rules (on Ubuntu/Debian with iptables-persistent)
# iptables-save > /etc/iptables/rules.v4
