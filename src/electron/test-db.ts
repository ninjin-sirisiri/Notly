// src/electron/test-db.ts
import { getPrismaClient } from "./database";

async function testDatabase() {
  console.log("データベーステストを開始...");

  const prisma = getPrismaClient();

  try {
    // フォルダを作成
    const folder = await prisma.folder.create({
      data: {
        name: "テストフォルダ",
      },
    });
    console.log("✓ フォルダ作成成功:", folder);

    // ノートを作成
    const note = await prisma.note.create({
      data: {
        title: "テストノート",
        filePath: "/path/to/test.md",
        folderId: folder.id,
      },
    });
    console.log("✓ ノート作成成功:", note);

    // データを取得
    const allNotes = await prisma.note.findMany({
      include: {
        folder: true,
        tags: true,
      },
    });
    console.log("✓ ノート一覧取得成功:", allNotes);

    console.log("\n✓ すべてのテストが成功しました！");
  } catch (error) {
    console.error("✗ テスト失敗:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
