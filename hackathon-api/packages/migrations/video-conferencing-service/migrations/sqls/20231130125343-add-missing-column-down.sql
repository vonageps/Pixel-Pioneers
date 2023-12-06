/* Replace with your SQL commands */
ALTER TABLE videochatms.video_session_details DROP COLUMN deleted_on;
ALTER TABLE videochatms.video_session_details DROP COLUMN deleted_by;

ALTER TABLE videochatms.session_attendees DROP COLUMN deleted_on;
ALTER TABLE videochatms.session_attendees DROP COLUMN deleted_by;