function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (!bytes) {
        return '0 Byte'
    }

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)

    if (classes.length) {
        node.classList.add(...classes)
    }

    if (content) {
        node.textContent = content
    }

    return node
}

function noop() {}

export function upload(selector, options) {
    let files
    let htmlFile = []
    document.body.insertAdjacentHTML('afterbegin', startHTML())
    const input = document.querySelector(selector)
    const onUpload = options.onUpload ?? noop

    const preview = element('div', ['preview'])
    const open = element('button', ['btn'], 'Открыть')
    const upload = element('button', ['btn', 'primary'], 'Загрузка...')
    upload.disabled = true
    upload.style.display = 'none'
    upload.style.backgroundColor = '#999999'
    upload.style.borderColor = '#999999'

    if (options.multi) {
        input.setAttribute('multiple', 'true')
    }
    if (options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }

    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', open)
    


    const triggerInput = () => input.click()
    const changeHandler = event => {
        if (!event.target.files) {
            return
        }
        
        files = Array.from(event.target.files)
        files.forEach(file => {
    
            if (!file.type.match('image')) {
                return alert('Загружай только картинки!')  
            }
            htmlFile = []
            preview.innerHTML = ''
            open.disabled = true
            upload.style.display = 'inline'
            upload.disabled = true
            upload.textContent = 'Загрузка...'
            upload.style.backgroundColor = '#999999'
            upload.style.borderColor = '#999999'
            const reader = new FileReader()
            reader.onload = ev => {
                const src = ev.target.result
                htmlFile.push(`
                <div class="preview-image"> 
                    <div class="preview-remove" data-name="${file.name}">&times;</div>
                    <img src="${src}" alt="${file.name}" />
                    <div class="preview-info">
                        <span>${parseText(file.name, 15)}</span>
                        ${bytesToSize(file.size)}
                    </div>    
                </div>
                `)
                
                if (htmlFile.length === event.target.files.length) {
                    test()
                    function test() {
                        let current = 0

                        setTimeout(function go() {
                            preview.insertAdjacentHTML('beforeend', htmlFile[current])
                            if (current < htmlFile.length - 1) {
                                setTimeout(go, 500)
                            }
                            current++
                            if (preview.querySelectorAll('.preview-image').length === event.target.files.length) {
                                open.disabled = false
                                upload.disabled = false
                                upload.style.backgroundColor = '#42b983'
                                upload.style.borderColor = '#42b983'
                                upload.textContent = 'Загрузить'
                            }
                        }, 1);
                    }
                }

                preview.querySelectorAll('.preview-image img').forEach(i => {
                    setTimeout(() => {
                        i.previousSibling.parentElement.style.maxHeight = i.clientHeight + 'px'
                    }, 300);
                })
            }
            reader.readAsDataURL(file)

        })
        
    }

    const removeHandler = e => {
        if (!e.target.dataset.name) {
            return
        }

        const {name} = e.target.dataset
        files = files.filter(file => file.name !== name)

        if (!files.length) {
            upload.style.display = 'none'
        }

        const block = preview.querySelector(`[data-name="${name}"]`).closest('.preview-image')
        block.classList.add('removing')
        setTimeout(() => {
            block.remove()
        }, 250);
    }

    const clearPreview = el => {
        
        el.style.bottom = 0
        el.innerHTML = `<div class="preview-info-progress" data-firebase-name="${el.previousSibling.previousElementSibling.alt}"></div>`
    }

    const uploadHandler = () => {
        preview.querySelectorAll('.preview-remove').forEach(e => e.remove())
        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(clearPreview)
        onUpload(files, previewInfo)
        upload.textContent = ''
        upload.classList.add('clickBtn')
        
    }

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandler)
}

function parseText(text, symbl) {
    if (text.length > symbl) {
        return text.slice(0, symbl) + '...'
    }
    return text
}

function startHTML() {
    return `
        <div class="container">
            <div class="card">
                <input type="file" id="file">
                <a href="https://github.com/Ksooft" target="_blank"><i class="link-github fab fa-github"></i></a>
            </div>
        </div>
    `
}
