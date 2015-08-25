# chrome-app-manager
Communicate between a webview element and the Chrome Apps API

## API

### fileSystem

All fileSystem calls need a `label` parameter that represents a directory selected by the user.  
Selected directories are stored persistently in the app so that the popup appears only once per label.

#### selectDirectory

Trigger a directory selection and saves it under the provided label.  
This method is the only way to change a directory for a label after it has been set once.

#### readDirectory

Read the contents of a directory. Returns an array of elements in the directory with the following properties:  
* `name` (string, file or directory name)
* `isDirectory` (boolean)
* `isFile` (boolean)

#### readFile

Read the contents of a file. Returns a string or an ArrayBuffer depending on the encoding option.

__params__
* `name` file name to read
* `encoding` format of the returned data (default: text). Possible values are:
 * text: plain text
 * base64: base 64 encoded string (as dataURL)
 * buffer: ArrayBuffer

#### writeFile

Write data to a file.

__params__
* `name` file name to write
* `encoding` see readFile
* `exclusive` boolean indicating of the action should fail when the file already exists (default: false)
* `type` mime type of the data (default: text/plain)
