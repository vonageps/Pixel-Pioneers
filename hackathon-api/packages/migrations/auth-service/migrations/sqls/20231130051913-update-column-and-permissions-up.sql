/* Replace with your SQL commands */
ALTER TABLE main.users 
ADD COLUMN IF NOT EXISTS join_call_data jsonb NULL;
UPDATE main.roles SET permissions = array_cat(permissions,'{CreateTransactions, 
  CreateMeetingSession,
  GenerateMeetingToken,
  StartMeetingArchive,
  StopMeetingArchive,
  GetMeetingArchives,
  DeleteMeetingArchive,
  StopMeeting,
  SetMeetingUploadTarget,
  GetMeetingAttendees,
  EditMeeting
}')
where role_type = 3;
UPDATE main.roles SET permissions = array_cat(permissions,'{ 
  CreateMeetingSession,
  GenerateMeetingToken,
  StartMeetingArchive,
  StopMeetingArchive,
  GetMeetingArchives,
  DeleteMeetingArchive,
  StopMeeting,
  SetMeetingUploadTarget,
  GetMeetingAttendees,
  EditMeeting
}')
where role_type = 1;