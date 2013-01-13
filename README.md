## Anvil Bower Plugin

Adds bower commands to anvil (somewhat redundant, you could just use bower...) and attempts to move resources from the package into package specific subfolders under ./ext in the output directory.

### Warning
Bower and TJ Holowaychuck's Component tools are incompatible. If you're installing components using Holowaychuck's component, then pretty much all the bower commands break. This has nothing to do with anvil; please don't report the issue to me :)

## Command Line
Really the only advantage here is not having to have bower installed globally. To issue any command, you just type "anvil bower [command] [args]" and anvil will pass the task on.

## Dependencies
If you want Anvil to auto-install your client dependencies, you can list them in your build file like this:

```javascript
{
	"anvil.bower": {
		"dependencies": [
			"backbone",
			"underscore"
		]
	}
}

This extension will check for the presence of these packages before each build and ensure they've been installed.

## Problems
Unfortunately not everyone follows the same conventions in their package.json or component.json files so there's no predictable way for anvil to know where to find the component's resources. If there's no folder under lib/ext for a component, it's because the author failed to specify; please feel free to let them know they're doing it wrong.

## Installation

anvil install anvil.bower