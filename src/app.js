import firebase from 'firebase/app'
import 'firebase/storage'
import { upload } from './upload'

const firebaseConfig = {
    // Your config firebase
}
firebase.initializeApp(firebaseConfig)

const storage = firebase.storage()

upload('#file', {
    multi: true,
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        let finishMessage = 0
        files.forEach(file => {
            blocks.forEach(b => {
                const upload = document.querySelector('.btn.primary')
                let block = b.querySelector(`.preview-info-progress[data-firebase-name="${file.name}"]`)
                if (block) {
                    const ref = storage.ref(`images/${file.name}`)
                    const task = ref.put(file)
                    task.on('state_changed', snapshot => {
                        const percentage = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0) + '%'
                        block.textContent = percentage
                        block.style.width = percentage
                    }, error => {
                        console.log(error);
                    }, complete => {
                        task.snapshot.ref.getDownloadURL().then(url => {
                            block.innerHTML = `<a href="${url}" target="_blank" class="link-download">Поделиться</a>`
                            block.style.fontWeight = 500
                            block.addEventListener('click', linkDownloadHandler)
                            setTimeout(() => {
                                finishMessage += 1
                                if (finishMessage === files.length) {
                                    upload.classList.remove('clickBtn')
                                    upload.classList.add('validateBtn')
                                    upload.innerHTML = '<i class="fas fa-check"></i>'
                                    setTimeout(() => {
                                        alert('Все изображения загружены! Теперь вы можете ими поделиться')
                                        upload.classList.remove('validateBtn')
                                        upload.style.display = 'none'
                                    }, 350);
                                }
                            }, 200);
                        })
                    })
                }
            })
            
        })
    }
})

function linkDownloadHandler(event) {
    event.preventDefault()
    if (event.target.classList.contains('link-download')) {
        const urlFile = event.target.getAttribute('href')
        const copyUrl = document.createElement('span')
        document.body.insertAdjacentElement('beforebegin', copyUrl)
        copyUrl.textContent = urlFile
        copyUrl.style.position = 'absolute'
        copyUrl.style.left = 999999999 + 'px'
        copyUrl.style.opacity = 0
        
        const range = document.createRange()
        range.selectNode(copyUrl)
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        event.target.closest('.preview-image').style.overflow = 'visible'
        event.target.closest('.preview-info-progress').classList.add('tooltip')

        setTimeout(() => {
            event.target.closest('.preview-info-progress').classList.remove('tooltip')
            event.target.closest('.preview-image').style.overflow = 'hidden'
        }, 2000);

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Oops, unable to copy');
        }

        window.getSelection().removeAllRanges();
        copyUrl.remove()
    }
}