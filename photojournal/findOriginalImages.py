#!/usr/bin/env python

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

def find_photo_from_year(filename, year):
  root_search_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'Photos')
  search_path = os.path.normpath(os.path.join(root_search_path, '%s' % year))
  #print 'Searching in %s for %s' % (search_path, filename)
  args = ['find', search_path, '-name', filename]
  proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  stdout, stderr = proc.communicate()
  return [{'year': year, 'photo': x} for x in stdout.splitlines() if x.find('/.picasaoriginals/') == -1 and x.find('/Originals/') == -1]

def copy_photo(source, destination):
  print 'Copying %s to %s' % (source, destination)
  dir = os.path.dirname(destination)
  if not os.path.isdir(dir):
    os.mkdir(dir)
  shutil.copyfile(source, destination)

def main():
  data_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
  data_file = open(data_file_path)
  data_string = data_file.read()
  json_data_string = ensure_json(data_string)
  data = json.loads(json_data_string)
  for entry in data:
    # TODO: Consider looking for originals of photos already copied to photojournal/.
    if entry.get('hidden', False) == False and entry.get('photo', '').startswith('http'):
      filename = os.path.basename(entry['photo'])
      year = entry['year']
      hits = find_photo_from_year(filename, year)
      if len(hits) == 0:
        hits = find_photo_from_year(filename, year - 1)
        for hit in find_photo_from_year(filename, year + 1):
          hits.append(hit)
      if len(hits) == 0:
        print 'No hits for %s from year %s' % (filename, year)
      elif len(hits) == 1:
        source = hits[0]['photo']
        year = hits[0]['year']
        destination = os.path.join('%s' % year, os.path.basename(source))
        copy_photo(source, destination)
        entry['photo'] = destination
      elif len(hits) > 1:
        print 'Multiple hits for %s from year %s: %s' % (filename, year, hits)
  output_file = open(re.sub('.json', '.new.json', data_file_path), 'w')
  json.dump(data, output_file, indent=2, separators=(',', ': '), sort_keys=True)
  output_file.close()

if __name__ == '__main__':
  sys.exit(main())
