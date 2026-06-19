import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('accountNumber');

    if (!accountNumber) {
      return NextResponse.json({ success: false, message: "Missing accountNumber" }, { status: 400 });
    }

    const snapshot = await db.collection('labels').where('account_number', '==', accountNumber).get();
    
    let labels = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Add default labels if empty or just always return them?
    // Let's just return what's in the DB. We will seed default labels in the frontend if empty.

    return NextResponse.json({ success: true, data: labels }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accountNumber, name, color } = body;

    if (!accountNumber || !name || !color) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const newLabel = {
      account_number: accountNumber,
      name,
      color,
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('labels').add(newLabel);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newLabel } 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const accountNumber = searchParams.get('accountNumber');

    if (!id || !accountNumber) {
      return NextResponse.json({ success: false, message: "Missing id or accountNumber" }, { status: 400 });
    }

    const docRef = db.collection('labels').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Label not found" }, { status: 404 });
    }

    if (doc.data()?.account_number !== accountNumber) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await docRef.delete();

    const categoryName = doc.data()?.name;
    if (categoryName) {
      const txSnapshot = await db.collection('transactions')
        .where('account_number', '==', accountNumber)
        .where('category', '==', categoryName)
        .get();
      
      const batch = db.batch();
      txSnapshot.docs.forEach((txDoc: any) => {
        batch.update(txDoc.ref, { category: null });
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true, message: "Label deleted" }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
