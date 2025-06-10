# Flow Launcher Plugin for Scrapbox

![Image from Gyazo](https://i.gyazo.com/87502bd4b06c16d6b96ec708912cbb6b.gif)

This repository contains a template for creating a [Flow Launcher](https://www.flowlauncher.com/) plugin using the [Deno](https://deno.land/) runtime.

> **Warning**
>
> - Since this compiles to an executable, npm modules are not yet supported. See [this thread](https://github.com/denoland/deno/issues/16632) for more information.
> - All packages should directly be imported from the url and not via an import_map.

## Development

To be able to test this easily, you need to create a symlink between this directory and the plugin directory from Flow Launcher. This can be done by searching `Flow Launcher UserData Folder` in the launcher and pressing enter. The plugins are found in the `Plugins` folder.

You can create a symlink by opening command prompt (CMD) in Windows and typing:

```CMD
mklink /J [flow-launcher-plugin-folder]/[folder-name] [project-root]
```

An example would look like this:

```CMD
mklink /J C:\Users\Joel\AppData\Roaming\FlowLauncher\Plugins\flow-plugin C:\Users\Joel\code\flow-plugin
```

After this is set up. You can run:

```bash
deno task build
```

To compile the code to and executable. Now **restart** Flow Launcher and the plugin should be loaded.

> **Note**
>
> - You **don't** need to restart Flow Launcher every time you make a change.
> - However, you do need to run the `build` command everytime you make a change. I hope this is not needed in the future but the `deno compile` command does't have a watch mode (yet).

## Publishing

When you want to release and publish a new version, just push to the `main` branch and it wil automatically create a new release and tag with the correct versions.

To add the plugin to the official Flow Launcher plugin manifest, follow [this](https://github.com/Flow-Launcher/Flow.Launcher.PluginsManifest#readme) guide.
