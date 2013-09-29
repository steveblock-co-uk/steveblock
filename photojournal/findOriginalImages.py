#!/usr/bin/env python

"""For each image referenced by the photo journal, attempts to find the
original, full-size image on the local machine and updates the photo journal to
use that.
"""

import json;
import re;
import os;
import shutil;
import subprocess;
import sys;

def ensure_json(data):
  # Quote keys
  for key in ['size', 'year', 'month', 'day', 'photo', 'caption', 'link', 'url', 'owner', 'portrait', 'x', 'y', 'hidden']:
    data = re.sub(key + ':', '"' + key + '":', data)
  # Swap single quotes for double quotes
  data = re.sub(': *\'', ': "', data)
  data = re.sub('\' *,', '",', data)
  data = re.sub('\' *}', '"}', data)
  # Remove escaped single quotes
  data = re.sub('\\\\\'', '\'', data)
  return data

def main():
  data_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
  data_file = open(data_file_path)
  data_string = data_file.read()
  json_data_string = ensure_json(data_string)
  data = json.loads(json_data_string)
  output_file = open(re.sub('.json', '.new.json', data_file_path), 'w')
  json.dump(data, output_file, indent=2, separators=(',', ': '), sort_keys=True)
  output_file.close()

if __name__ == '__main__':
  sys.exit(main())
