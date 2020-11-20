// This script handles the chunked video uploads for FB Graph API
console.clear()
if(!checkbox2.value){
  return
}
// const newBlob = new Blob([filepicker1.file.data], {type:'video/mp4'})
// const fullString = filepicker1.file.data
const reader = new FileReader()
let video_id
let upload_session_id
//###################################
// Testing Binary Chunking
//###################################
let str = filepicker1.file.data // base64 string representing file data
function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
  	// console.log(bytes.buffer)
    return bytes.buffer;
}
const buffer = base64ToArrayBuffer(str)
const blob = new Blob([buffer], {type: 'video/mp4'})
//###################################
// Step 1: Begin file upload transfer
//###################################
async function start(){
  try {
    const result = await start_videoUpload.trigger({
      additionalScope: {account_id: accountSelection.data.id, access_token: accountSelection.data.token, file_size: blob.size }
    })
    console.log("Start Response: ", result)
    if(result){
      video_id = result.video_id
      upload_session_id = result.upload_session_id
      continueUpload(result)
    }
  }
  catch(err) {
    console.log(err)
  } 
}
//###################################
// Step 2: conditional step check
//###################################
function continueUpload(response){
  console.log('%c Checking video upload progress...', 'color: #7FFF00', response)
  let start_offset = response.start_offset
  let end_offset = response.end_offset
  if(start_offset == end_offset){
    finish(response)
  } else {
    transfer(response)
  }
}
//###################################
// Step 3: upload of binary data
//###################################
async function transfer(result){
  let start_offset = result.start_offset
  let end_offset = result.end_offset
  let chunk = blob.slice(start_offset, end_offset, "application/octet-stream")
  reader.readAsBinaryString(chunk)
  reader.onload = async () => {
    // const str = reader.result
    let dataURL = btoa(reader.result)
		dataURL = dataURL.substr(dataURL.indexOf(',') + 1);
    let sampleFile = {
      type: "__FILE_OBJECT_AS_JSON__",
      contentType: "application/octet-stream",
      name: filepicker1.file.name,
      data: dataURL
    }
    try {
      console.log('%c Initiating video upload...', 'color: #7FFF00')
      console.log("File:", sampleFile)
      const response = await transfer_videoUpload.trigger({
        additionalScope: {account_id: accountSelection.data.id, access_token: accountSelection.data.token, start_offset: result.start_offset, upload_session_id: upload_session_id, video_id: video_id, video_file_chunk: sampleFile}
      })
      if(response){
        console.log("Response:", response)
        continueUpload(response, ) 
      }
    }
    catch(err) {
      return err
    }    
  }    
}
//############################################
// Step 4: Finish video upload and title video
//############################################
async function finish(){
  try {
    console.log('%c Finishing video upload...', 'color: #7FFF00')
    const result = await finish_videoUpload.trigger({
      additionalScope: {account_id: accountSelection.data.id, access_token: accountSelection.data.token, upload_session_id: upload_session_id, title: filepicker1.file.name}
    })
    console.log("Result:", result)
  }
  catch(err) {
    return
  }
}
//#######
// Init
//#######
return start()