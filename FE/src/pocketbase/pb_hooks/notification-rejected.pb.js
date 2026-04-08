//// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const original = e.record.original();
  const currentStatus = e.record.get("status");
  const previousStatus = original.get("status");
  
  // Only create notification if status changed to 'rejected'
  if (previousStatus !== "rejected" && currentStatus === "rejected") {
    const notification = new Record($app.findCollectionByNameOrId("notifications"), {
      user_id: e.record.get("user_id"),
      type: "rejected",
      item_id: e.record.id,
      message: "Bài đăng của bạn bị từ chối. Vui lòng kiểm tra lại thông tin.",
      is_read: false
    });
    $app.save(notification);
  }
  
  e.next();
}, "lost_items");