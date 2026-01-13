## Hexagonal Architecture là gì ?

- Hexagonal Architecture là cách tổ chức code nhằm mục địch tách nghiệp vụ (domain) với các yêu tố khác (UI, DB, framework, API)
- Mục đích: dễ maintain khi có thay đổi, dễ test (test ngay ở phần logic nghiệp vụ mà không cần quan tâm adapter dùng công nghệ gì)

## Các thành phần chính

### Core

- nơi chứa các logic quan trọng
- chỉ quan tâm logic nghiệp vụ thuần không phụ thuộc bất cứ thứ gì từ bên ngoài

### Ports

- nằm trong core và do core định nghĩa
- nơi chứa các Interface quy định các chuẩn input, output giúp core giao tiếp với thế giới bên ngoài
- **Inbound Ports - driving**
  - nhận vào Domain Object từ adapters truyền vào core
  - các hàm core cho phép adapters gọi vào
- **Outbound Ports - driven**
  - chuyển Domain Object cho adapters
  - các hàm mà core cần adapters thực hiện

### Services

- điều phối triển khai luồng nghiệp vụ
- implements từ các driving

### adapters

- là nơi chuyển các logic thành code, chịu trách nhiệm chuyển đổi các Domain Object thành code và ngược lại
- **Primary Adapter**:
  - nhận y/c từ user/ api -> code chuyển đổi thành Domain Object -> truyền vào Inbound Ports
- **Secondary Adapter**:
  - nhận Domain Object từ Outbound Ports -> code

## Test trong Hexagonal

- test theo các layer
- Domain (Entity): test độc lập hoàn toàn
- Services (Application): phải mock các Post để test

### các bước viết test

- gồm 3 bước Arrange - Act - Assert
  - B1 Arrange: setup data và mock
  - B2 Act: thực hiện action
  - B3 Assert: verify kết quả

### các hàm Verify thường dùng (Vitest)

toBeInstanceOf( ... ) - Verify cùng kiểu dữ liệu
toHaveBeenCalledWith(...) - Verify tham số của bất kỳ lần gọi nào
toHaveBeenLastCalledWith(...) - Verify lần gọi cuối
toHaveBeenNthCalledWith(n, ...) - Verify lần gọi thứ n
toHaveBeenCalledTimes(n) - Verify số lần gọi
expect.objectContaining({...}) - Partial match object
not.toHaveBeenCalled() - Verify không được gọi
