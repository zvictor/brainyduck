#!/bin/bash
set -e
cd `dirname "$0"`

cmd=./node_modules/.bin/jest

if [ !  -f "$cmd" ] ; then
  echo "Jest could not be found. Please run 'npm install' in the tests folder";
  exit 1
fi

if [ -z ${TESTS_SECRET+x} ]; then
  echo "ERROR: TESTS_SECRET is not defined. Expecting the environment to set the TESTS_SECRET variable, ex: 'TESTS_SECRET=klJSDojasd8ojasd $0'";
  exit 1;
fi

NODE_OPTIONS=--experimental-vm-modules $cmd --silent=false --detectOpenHandles "$@"
