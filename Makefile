build: 
	@component build --dev

components: component.json
	@component install --dev

test:
	@jasmine-node tests --verbose --forceexit
  
clean:
	rm -rf build components

.PHONY: clean components build test 


