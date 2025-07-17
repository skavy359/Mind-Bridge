class CloudStorageException implements Exception {
  const CloudStorageException();
}

class CouldNotCreateNoteException extends CloudStorageException {}

class CouldNotGetAllNoteException extends CloudStorageException {}

class CouldNotUpdatesNoteException extends CloudStorageException {}

class CouldNotDeleteNoteException extends CloudStorageException {}
