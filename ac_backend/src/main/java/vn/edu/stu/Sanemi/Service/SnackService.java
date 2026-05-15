package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.Entity.SnackItems;
import vn.edu.stu.Sanemi.Repository.SnackItemRepository;
import vn.edu.stu.Sanemi.dto.request.SnackRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SnackService {

    SnackItemRepository snackItemRepository;

    // Lấy menu cho user — chỉ item đang available
    public List<SnackItems> getAvailableMenu() {
        return snackItemRepository.findByAvailableTrue();
    }

    // Lấy toàn bộ cho admin (gồm cả item đang ẩn)
    public List<SnackItems> getAllMenu() {
        return snackItemRepository.findAll();
    }

    public SnackItems createItem(SnackRequest request) {
        SnackItems item = SnackItems.builder()
                .name(request.getName())
                .price(request.getPrice())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .available(request.isAvailable())
                .build();
        return snackItemRepository.save(item);
    }

    public SnackItems updateItem(Integer id, SnackRequest request) {
        SnackItems item = snackItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        item.setImageUrl(request.getImageUrl());
        item.setAvailable(request.isAvailable());
        return snackItemRepository.save(item);
    }

    // Soft-delete: chỉ ẩn, không xóa khỏi DB để giữ lịch sử booking
    public void toggleAvailability(Integer id) {
        SnackItems item = snackItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        item.setAvailable(!item.isAvailable());
        snackItemRepository.save(item);
    }

    // Xóa hẳn — chỉ dùng khi chắc chắn item chưa có trong booking nào
    public void deleteItem(Integer id) {
        snackItemRepository.deleteById(id);
    }
}
