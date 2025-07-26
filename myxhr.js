console.log('interceptXhrResponse is starting...')
const interceptionRules = []
function interceptXhrResponse(urlPattern, responseHandler) {
  interceptionRules.push({ urlPattern, responseHandler })
}
function handleInterceptedResponse(response, url) {
  const interceptionRule = interceptionRules.find((item) => item.urlPattern.test(url))
  if (interceptionRule) {
    const { responseHandler } = interceptionRule
    return responseHandler(response, url)
  } else {
    console.log('Not found the response handler with this url: ' + url)
  }
  return response
}
const OriginalXMLHttpRequest = window.XMLHttpRequest
class XMLHttpRequest extends OriginalXMLHttpRequest {
  get responseText() {
    if (this.readyState !== 4) {
      return super.responseText
    }
    return handleInterceptedResponse(super.responseText, this.responseURL)
  }
  get response() {
    if (this.readyState !== 4) {
      return super.response
    }
    return handleInterceptedResponse(super.response, this.responseURL)
  }
}
window.XMLHttpRequest = XMLHttpRequest
const { fetch: originalFetch } = window
window.fetch = async (...args) => {
  const [resource, config] = args
  console.log('fetch response before')
  const response = await originalFetch(resource, config)
  console.log('fetch response after')
  return response
}
console.log('interceptXhrResponse is loaded.')

interceptXhrResponse(/.+/, (response, url) => {
  return `Response of ${url}: Intercepted. Original response length: ${String(response).length}`
})
