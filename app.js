// Check to see if `serviceWorker` is present in the `navigator` object.
if ('serviceWorker' in navigator) {

    // Register our service worker file. It has to be an external file for
    // certain lifecycles to occure.
    navigator.serviceWorker.register('/sw.js')

        // These promises aren't required but provide dev feedback.
        .then((registration) => {
            console.log('ServiceWorker registered', registration)
        })
        .catch((error) => {
            console.log('ServiceWorker failed', error);
        });

}
