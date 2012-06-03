REPORTER=Spec


.PHONY: test
test ::
	./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		test/helper.js \
		test/x-recorder/*-test.js

