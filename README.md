# Introduction

It is a quite simple tool, it can be used to check and find syntax errors of your programming files recursively.
Currently, it supports Ruby, PHP, Perl, Lua, C/CPP, Bash, Javascript and Python scripts. 

Basically, for every file, it uses its own program to check the syntax, that means you should have the program installed accordingly.

## Installation

    $ [sudo] npm install syntax-checker -g

    If you need to check javascript files, install uglifyjs please.
    $ [sudo] npm install uglifyjs -g

## Usage

    $ syntax-checker /path/to/your/directory/to/check
    $ syntax-check --help

## Current Version

0.0.2
