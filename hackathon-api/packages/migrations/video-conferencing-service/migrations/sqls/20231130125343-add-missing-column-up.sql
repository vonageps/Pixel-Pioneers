/* Replace with your SQL commands */
ALTER TABLE videochatms.video_session_details ADD COLUMN deleted_on  timestamptz ;
ALTER TABLE videochatms.video_session_details ADD COLUMN deleted_by uuid   ;
ALTER TABLE videochatms.session_attendees ADD COLUMN deleted_on  timestamptz ;
ALTER TABLE videochatms.session_attendees ADD COLUMN deleted_by uuid   ;