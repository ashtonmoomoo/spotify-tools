#! /bin/bash

if [[ -z "${TOKEN}" ]]; then
  echo "TOKEN env var is not set :("
  exit 1
else
  token=$TOKEN
fi

echo $(curl --request GET --url "https://api.spotify.com/v1$1?market=nz" --header "Authorization: Bearer $token" --header "Content-Type: application/json")
