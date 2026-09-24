# AWS 코스 노트(public/notes-aws.html)를 만든다. 프로젝트 루트에서: python3 tools/aws/gen_aws.py
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.dirname(HERE))
from aws_quiz import UNITS, COURSE_META
from notes_gen import write_notes

write_notes(UNITS, **COURSE_META)
