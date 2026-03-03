# Hướng dẫn triển khai (Deploy) ứng dụng lên Vercel

Ứng dụng "Shopee Profit Master" này được xây dựng bằng **React (Vite)** và **Tailwind CSS**, hoàn toàn không cần backend (chỉ chạy ở phía client). Do đó, việc đưa ứng dụng này lên **Vercel** là cực kỳ dễ dàng, nhanh chóng và **hoàn toàn miễn phí**.

Dưới đây là 2 cách để bạn có thể đưa ứng dụng này lên Vercel:

---

## Cách 1: Triển khai trực tiếp qua Vercel CLI (Nhanh nhất nếu bạn có sẵn code trên máy)

Nếu bạn đã tải toàn bộ mã nguồn (source code) của ứng dụng này về máy tính cá nhân:

**Bước 1: Cài đặt Vercel CLI**
Mở Terminal (hoặc Command Prompt/PowerShell) và chạy lệnh sau (yêu cầu máy tính đã cài đặt Node.js):
```bash
npm i -g vercel
```

**Bước 2: Đăng nhập vào Vercel**
Chạy lệnh sau và làm theo hướng dẫn trên màn hình để đăng nhập (bạn có thể đăng nhập bằng tài khoản GitHub, GitLab, hoặc Email):
```bash
vercel login
```

**Bước 3: Triển khai (Deploy)**
Di chuyển vào thư mục chứa mã nguồn của ứng dụng (nơi có file `package.json`), sau đó chạy lệnh:
```bash
vercel
```
* Vercel sẽ hỏi bạn một vài câu hỏi thiết lập ban đầu (bạn cứ nhấn `Enter` để chọn mặc định cho hầu hết các câu hỏi).
* Vercel sẽ tự động nhận diện đây là dự án Vite (React) và tự động cấu hình lệnh build (`npm run build`) cũng như thư mục đầu ra (`dist`).
* Đợi khoảng 1-2 phút, Vercel sẽ cung cấp cho bạn một đường link (URL) trực tiếp để truy cập ứng dụng của bạn trên internet!

**Bước 4: Triển khai bản chính thức (Production)**
Lệnh `vercel` ở trên tạo ra một bản xem trước (Preview). Để tạo bản chính thức (Production), hãy chạy:
```bash
vercel --prod
```

---

## Cách 2: Triển khai thông qua GitHub (Khuyên dùng để dễ dàng cập nhật sau này)

Đây là cách phổ biến và chuyên nghiệp nhất. Mỗi khi bạn sửa code và đẩy (push) lên GitHub, Vercel sẽ tự động cập nhật trang web của bạn.

**Bước 1: Đưa mã nguồn lên GitHub**
1. Tạo một repository mới trên [GitHub](https://github.com/).
2. Đẩy (push) toàn bộ mã nguồn của ứng dụng này lên repository đó.

**Bước 2: Kết nối Vercel với GitHub**
1. Truy cập [Vercel.com](https://vercel.com/) và đăng nhập (hoặc đăng ký) bằng tài khoản GitHub của bạn.
2. Tại trang Dashboard của Vercel, click vào nút **"Add New..."** và chọn **"Project"**.
3. Trong phần "Import Git Repository", tìm đến repository chứa mã nguồn ứng dụng của bạn và click **"Import"**.

**Bước 3: Cấu hình và Deploy**
1. **Project Name:** Bạn có thể đổi tên dự án (tên này sẽ nằm trong đường link URL của bạn, ví dụ: `shopee-profit-master.vercel.app`).
2. **Framework Preset:** Vercel thường sẽ tự động nhận diện là **Vite**. Nếu không, hãy chọn `Vite` từ menu thả xuống.
3. **Build and Output Settings:** Giữ nguyên mặc định:
   * Build Command: `npm run build` hoặc `vite build`
   * Output Directory: `dist`
   * Install Command: `npm install`
4. Click nút **"Deploy"**.

**Bước 4: Hoàn thành!**
* Vercel sẽ bắt đầu tải code của bạn về, cài đặt thư viện (npm install), xây dựng ứng dụng (npm run build) và đưa lên mạng.
* Quá trình này mất khoảng 1-2 phút. Khi hoàn tất, bạn sẽ thấy màn hình chúc mừng cùng với đường link URL chính thức của ứng dụng.

---

## Lưu ý quan trọng

* **Không cần Backend:** Vì ứng dụng này tính toán trực tiếp trên trình duyệt (Client-side) và lưu dữ liệu vào Local Storage, bạn không cần phải thiết lập bất kỳ cơ sở dữ liệu (Database) hay máy chủ (Server) nào trên Vercel.
* **Biến môi trường (Environment Variables):** Ứng dụng này hiện tại không sử dụng API key hay biến môi trường bảo mật nào, nên bạn không cần cấu hình phần này trên Vercel.
* **Cập nhật:** Nếu bạn dùng Cách 2 (GitHub), mỗi lần bạn sửa code và `git push` lên nhánh `main` (hoặc `master`), Vercel sẽ tự động build và cập nhật trang web của bạn trong vòng vài phút.

Chúc bạn triển khai thành công!
