// Polyfill for Promise.withResolvers()
// This feature is available in newer JavaScript environments but not in all Node.js versions
export function setupPromisePolyfill() {
  if (typeof Promise.withResolvers !== 'function') {
    // @ts-ignore - Adding a method to the Promise prototype
    Promise.withResolvers = function() {
      let resolve!: (value: any) => void;
      let reject!: (reason?: any) => void;
      
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      
      return { promise, resolve, reject };
    };
    
    console.log('Promise.withResolvers polyfill installed');
  } else {
    console.log('Promise.withResolvers is natively supported');
  }
} 