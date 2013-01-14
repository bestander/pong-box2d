build: index.js
	@component build --dev

components: component.json
	@component install --dev

test:
	@jasmine-node tests
  
clean:
	rm -rf build components

.PHONY: clean


