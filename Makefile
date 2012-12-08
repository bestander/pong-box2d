build: index.js
	@component build

components: component.json
	@component install --dev

clean:
	rm -rf build components

.PHONY: clean


