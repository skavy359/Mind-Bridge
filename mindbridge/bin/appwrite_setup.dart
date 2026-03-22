import 'package:dart_appwrite/dart_appwrite.dart';
import 'package:dart_appwrite/enums.dart';

void main() async {
  const String endpoint = 'https://sgp.cloud.appwrite.io/v1';
  const String projectId = '69bea2b00028ecb66757';
  const String apiKey = 'standard_a8223ef5591dc63fcf0b5026c8cda9be24655d4c682f1f91eaf51e1ee2080b536f6c0184a7f8ad7eea889447ddb81f66b20c87d932b3eb73c9a1b54eb18acfe6556003e1fecc012bdb5d0ed57357254fda2232c613cebf07b91bd5bb9aa6474d717756d94508dabb3cfaa5f894ed7a94a27659338514ac83614e81026a3b5ac0';

  Client client = Client()
    ..setEndpoint(endpoint)
    ..setProject(projectId)
    ..setKey(apiKey);

  Databases databases = Databases(client);
  Storage storage = Storage(client);

  String dbId = 'mindbridge_db';

  try {
    print('Checking for existing databases...');
    final existingDatabases = await databases.list();
    if (existingDatabases.databases.isNotEmpty) {
      dbId = existingDatabases.databases.first.$id;
      print('Using existing database: $dbId (${existingDatabases.databases.first.name})');
    } else {
      print('Creating Database...');
      await databases.create(
        databaseId: dbId,
        name: 'MindBridge DB',
      );
      print('Database created!');
    }
  } on AppwriteException catch (e) {
    if (e.code == 409) {
      print('Database $dbId already exists. Proceeding...');
    } else if (e.code == 403) {
      print('Error 403: Plan limit reached. Attempting to use the first available database...');
      final existingDatabases = await databases.list();
      if (existingDatabases.databases.isNotEmpty) {
        dbId = existingDatabases.databases.first.$id;
        print('Redirected to existing database: $dbId');
      } else {
        rethrow;
      }
    } else {
      rethrow;
    }
  }

  try {
    print('Creating Notes Collection...');
    await databases.createCollection(
      databaseId: dbId,
      collectionId: 'notes',
      name: 'Notes',
      documentSecurity: true,
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );
    
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'title', size: 255, xrequired: true);
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'subject', size: 100, xrequired: true);
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'fileUrl', size: 1024, xrequired: true);
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'fileType', size: 20, xrequired: true);
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'uploadedBy', size: 255, xrequired: true);
    await databases.createStringAttribute(databaseId: dbId, collectionId: 'notes', key: 'uploaderName', size: 255, xrequired: true);
    await databases.createDatetimeAttribute(databaseId: dbId, collectionId: 'notes', key: 'uploadedAt', xrequired: true);
    
    print('Notes Collection schema created!');
    print('Notes Collection schema created!');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
      print('Notes collection already exists. Updating permissions...');
      await databases.updateCollection(
        databaseId: dbId,
        collectionId: 'notes',
        name: 'Notes',
        documentSecurity: true,
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
    }
  }

  await _ensureAttribute(databases, dbId, 'notes', 'title', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'notes', 'subject', 'string', size: 100);
  await _ensureAttribute(databases, dbId, 'notes', 'fileUrl', 'string', size: 1024);
  await _ensureAttribute(databases, dbId, 'notes', 'fileType', 'string', size: 20);
  await _ensureAttribute(databases, dbId, 'notes', 'uploadedBy', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'notes', 'uploaderName', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'notes', 'uploadedAt', 'datetime');

  await _ensureIndex(databases, dbId, 'notes', 'idx_uploadedBy', 'key', ['uploadedBy']);

  try {
    print('Creating Opportunities Collection...');
    await databases.createCollection(
      databaseId: dbId,
      collectionId: 'opportunities',
      name: 'Opportunities',
      documentSecurity: false,
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );
    print('Opportunities Collection schema created!');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
      print('Opportunities collection already exists. Updating permissions...');
      await databases.updateCollection(
        databaseId: dbId,
        collectionId: 'opportunities',
        name: 'Opportunities',
        documentSecurity: false,
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
    }
  }

  await _ensureAttribute(databases, dbId, 'opportunities', 'title', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'opportunities', 'company', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'opportunities', 'type', 'string', size: 50);
  await _ensureAttribute(databases, dbId, 'opportunities', 'location', 'string', size: 255);
  await _ensureAttribute(databases, dbId, 'opportunities', 'description', 'string', size: 5000);
  await _ensureAttribute(databases, dbId, 'opportunities', 'deadline', 'datetime');
  await _ensureAttribute(databases, dbId, 'opportunities', 'applyLink', 'string', size: 1024);
  await _ensureAttribute(databases, dbId, 'opportunities', 'postedAt', 'datetime');
  
  await _ensureIndex(databases, dbId, 'opportunities', 'idx_type', 'key', ['type']);
  await _ensureIndex(databases, dbId, 'opportunities', 'idx_postedAt', 'key', ['postedAt']);

  try {
    print('Creating Storage Bucket...');
    await storage.createBucket(
      bucketId: 'notes_bucket',
      name: 'Notes Storage',
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      fileSecurity: true,
      maximumFileSize: 50000000, // 50MB
      allowedFileExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
    );
    print('Storage Bucket created!');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
      print('Storage bucket already exists. Updating configuration...');
      await storage.updateBucket(
        bucketId: 'notes_bucket',
        name: 'Notes Storage',
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
        fileSecurity: true,
        maximumFileSize: 50000000,
        allowedFileExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
      );
    }
  }

  print('\n✅ Appwrite Schema Setup Complete!');
  print('IMPORTANT: Ensure your appwrite_service.dart uses Database ID: $dbId');
}

Future<void> _ensureAttribute(Databases databases, String dbId, String collId, String key, String type, {int? size}) async {
  try {
    if (type == 'string') {
      await databases.createStringAttribute(databaseId: dbId, collectionId: collId, key: key, size: size ?? 255, xrequired: true);
    } else if (type == 'datetime') {
      await databases.createDatetimeAttribute(databaseId: dbId, collectionId: collId, key: key, xrequired: true);
    }
    print('Attribute "$key" created in "$collId".');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
    } else {
      print('Error creating attribute "$key": ${e.message}');
    }
  }
}

Future<void> _ensureIndex(Databases databases, String dbId, String collId, String key, String type, List<String> attributes) async {
  try {
    await databases.createIndex(
      databaseId: dbId,
      collectionId: collId,
      key: key,
      type: IndexType.key,
      attributes: attributes,
    );
    print('Index "$key" created in "$collId".');
  } on AppwriteException catch (e) {
    if (e.code == 409) {
    } else {
      print('Error creating index "$key": ${e.message}');
    }
  }
}