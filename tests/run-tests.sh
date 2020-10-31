#!/bin/bash
set -e
cd `dirname "$0"`

cmd=./node_modules/.bin/ava

if [ !  -f "$cmd" ] ; then
  echo "Ava could not be found. Please run 'npm install' in the tests folder";
  exit 1
fi

if [ -z ${FAUGRA_SECRET+x} ]; then
  echo "ERROR: FAUGRA_SECRET is not defined. Expecting the environment to set the FAUGRA_SECRET variable, ex: 'FAUGRA_SECRET=klJSDojasd8ojasd $0'";
  exit 1;
fi

$cmd --serial --verbose --timeout 120000
