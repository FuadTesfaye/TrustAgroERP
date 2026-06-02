#!/bin/bash
set -e

echo "Logging into Keycloak..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin

echo "Creating realm trust-agro..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create realms -s realm=trust-agro -s enabled=true || echo "Realm might already exist"

echo "Creating client frontend-client..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create clients -r trust-agro -s clientId=frontend-client -s enabled=true -s publicClient=true -s 'redirectUris=["http://localhost:3000/*"]' -s 'webOrigins=["+"]' -s directAccessGrantsEnabled=true || echo "Client might already exist"

echo "Creating client admin-cli (needed for backend)..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create clients -r trust-agro -s clientId=admin-cli -s enabled=true -s directAccessGrantsEnabled=true -s publicClient=false -s secret=secret -s serviceAccountsEnabled=true || echo "admin-cli might already exist"

echo "Creating role ROLE_ADMIN..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create roles -r trust-agro -s name=ROLE_ADMIN || echo "Role might already exist"

echo "Creating user admin@trustagro.com..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create users -r trust-agro -s username=admin@trustagro.com -s enabled=true -s email=admin@trustagro.com -s firstName=System -s lastName=Administrator -s emailVerified=true || echo "User might already exist"

echo "Setting password for admin@trustagro.com..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password -r trust-agro --username admin@trustagro.com --new-password Admin@1234

echo "Assigning role to user..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh add-roles -r trust-agro --uusername admin@trustagro.com --rolename ROLE_ADMIN

echo "Done!"
