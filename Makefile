VERSION=0.3.0

all: run.min.js
	@: # silence

run.js: lib/run.js
	@cat lib/run.js | sed 's/@version@/$(VERSION)/' > $@

run.min.js: run.js
	@uglifyjs < $< > $@