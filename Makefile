build:
	rollup -c -i src/main.ts -o build/main.js

watch:
	rollup -w -c -i src/main.ts -o build/main.js

.PHONY: build watch
