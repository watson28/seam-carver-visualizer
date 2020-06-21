# seam-carver-visualizer
Web app to resize images using Seam Carver technique

![Gif with demo](seam-carver-demo.gif)

Highlights:
 * The application is built without any Javascript framework.
 * The computation is done in the browser using web workers.
 * Updates to the image are schedule using `requestAnimationFrame`.
 * Built using Typescript
 
 Future improvements:
  * Use Web assembly to speed up the time execution for large image.
