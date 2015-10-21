PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

# Scripts
js_source_files	:= $(wildcard src/*.js)
app_bundle		:= out/dist/main.js

lib_flags = node_modules/flag-icon-css

html_source_files		:= $(wildcard src/*.html)
css_source_files		:= $(wildcard src/*.css)
flags_css_files 		= $(lib_flags)/css/flag-icon.css
flags_image_files		:= $(wildcard $(lib_flags)/flags/*/*.svg)
json_files				:= $(wildcard data/*.json)

built_files			= $(app_bundle) \
					  $(html_source_files:src/%.html=out/dist/%.html) \
					  $(css_source_files:src/%.css=out/dist/%.css) \
					  $(flags_css_files:$(lib_flags)/css/%=out/dist/flags/%) \
					  $(flags_image_files:$(lib_flags)/flags/%=out/dist/flags/%) \
					  $(json_files:data/%=out/dist/data/%)

npm_bin		:= $(abspath node_modules/.bin)
browserify	= $(npm_bin)/browserify

port?=8000

define copy
	@mkdir -p $(dir $@)
	cp $< $@
endef

.PHONY: all clean available

all: $(built_files)

$(app_bundle): $(js_source_files) package.json
	@mkdir -p $(dir $@)
	$(browserify) src/main.js --standalone main -t [ babelify ] -o $@

out/dist/%.html: src/%.html
	$(copy)

out/dist/%.css: src/%.css
	$(copy)

out/dist/flags/%.css: node_modules/flag-icon-css/css/%.css
	$(copy)

out/dist/flags/%.svg: $(lib_flags)/flags/%.svg
	$(copy)
	
out/dist/data/%.json: data/%.json
	$(copy)
	
available: $(build_files)
	(cd out/dist && $(npm_bin)/http-server -p $(port) && --cors)

clean:
	rm -rf out/tmp out/dist out/reports

tmp:
	@echo $(built_files)