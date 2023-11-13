import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const initFolder = () => {
  //nếu không có đường dẫn 'TwitterProject/uploads' thì tạo ra
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        //fs thư viện thao tác với các đường dẫn
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/image/bla bla bla
      }) //mkdirSync: giúp tạo thư mục
    }
  })
}

//hinh.png=>hinh
//viết thêm hàm khi nhận filename : abv.png thì chỉ lấy abv để sau này ta gán thêm đuôi .jpeg
export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.') //[yiyque,qew,qe,png]
  nameArr.pop() //xóa phần tử cuối cùng, tức là xóa đuôi .png
  return nameArr.join('') //nối lại thành chuỗi
}

//video.mp4=>mp4
//làm lấy đuôi mở rộng của file
export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}

//hàm xử lý file mà client đã gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu ở đâu
    maxFiles: 4, //tối đa bao nhiêu
    keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg
    maxFileSize: 300 * 1024 * 4, //tối đa bao nhiêu byte, 300kb
    //xài option filter để kiểm tra file có phải là image không
    filter: function ({ name, originalFilename, mimetype }) {
      //name: name|key truyền vào của <input name = bla bla>
      //originalFilename: tên file gốc
      //mimetype: kiểu file vd: image/png
      //   console.log(name, originalFilename, mimetype) //log để xem, nhớ comment

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //mimetype? nếu là string thì check, k thì thôi
      //ép Boolean luôn, nếu k thì valid sẽ là boolean | undefined

      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      //nếu đúng thì return valid
      return valid
    }
  })
  //form.parse về thành promise
  //files là object có dạng giống hình test code cuối cùng
  return new Promise<File[]>((resolve, reject) => {
    //tại ép kiểu có tốn thời gian nên dùng Promise
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err) //để ý dòng này
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[]) //import { File } from 'formidable' để hết lỗi//vì và up singleImage nên lấy phần tử đầu tiên thoi
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, //vì video nên mình không đi qua bước xử lý trung gian nên mình sẽ k bỏ video vào temp
    maxFiles: 1, //tối đa bao nhiêu
    // keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg "nếu file có dạng asdasd.app.mp4 thì lỗi, nên mình sẽ xử lý riêng
    maxFileSize: 50 * 1024 * 1024, //tối đa bao nhiêu byte, 50MB
    //xài option filter để kiểm tra file có phải là video không
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      //files.video k phải image nha
      if (!files.video) {
        return reject(new Error('video is empty'))
      }
      //trong 1 cái file {originalFile(là tên ban đầu em gửi lên . đầy đủ luôn),filepath(là đường dẫn dẫn từ thư mục upload vào video mới của em),newFileName(ko có keepExtention nên là 1 đoạn chuỗi j đó ko có png)}
      //vì mình k xài keepExtensions nên file sau khi xử lý xong
      // của mình sẽ k có đuôi mở rộng, mình sẽ rename nó để lắp đuôi cho nó
      //duyệt qua từng file
      const videos = files.video as File[] //lấy ra danh sách các video đã upload
      //duyaatj qua từng video và
      videos.forEach((video) => {
        //lấy đuôi của tên gốc
        //lắp đuôi vào tên mới
        //lắp đuôi vào filepath:đường dẫn đến file mới
        const ext = getExtension(video.originalFilename as string) //lấy đuôi mở rộng của file cũ
        //filepath là đường dẫn đến tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        // fs.renameSync(video.filepath, video.filepath + '.' + ext) //rename lại đường dẫn tên file để thêm đuôi
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`)
        // video.newFilename = video.newFilename + '.' + ext //newFilename là tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        video.newFilename += `.${ext}` //gióng dòng trên nhưng pro hơn
        //lưu lại tên file mới để return ra bên ngoài, thì method uploadVideo khỏi cần thêm đuôi nữa
      })
      resolve(files.video as File[])
    })
  })
}
