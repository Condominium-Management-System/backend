import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function runCondoAdminE2ETest() {
  console.log('=== STARTING CONDO ADMIN END-TO-END VERIFICATION ===\n');

  try {
    // 1. Super Admin Login
    console.log('[1/9] Logging in as Super Admin...');
    const superAdminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'superadmin@yekondominium.com',
      password: 'Password123!',
    });
    const superToken = superAdminRes.data.data.accessToken || superAdminRes.data.data.token;
    console.log('✅ Super Admin login successful.');

    // 2. Create or Get a Condominium
    console.log('\n[2/9] Creating / Getting Condominium...');
    const condoRes = await axios.get(`${API_BASE}/condos`, {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    let testCondo = condoRes.data.data?.[0];

    if (!testCondo) {
      console.log('No condo found. Creating test condo...');
      const createCondoRes = await axios.post(
        `${API_BASE}/condos`,
        {
          condoName: 'Bole Atlas Heights',
          condoCode: 'BAH01',
          city: 'Addis Ababa',
          subCity: 'Bole',
          woreda: '03',
          noBlocks: 5,
        },
        { headers: { Authorization: `Bearer ${superToken}` } }
      );
      testCondo = createCondoRes.data.data;
    }
    console.log(`✅ Using Condo: "${testCondo.condoName}" (Code: ${testCondo.condoCode}, ID: ${testCondo.id})`);

    // 3. Register or Login as Condo Admin
    const condoAdminEmail = `condoadmin_${testCondo.condoCode.toLowerCase()}@test.com`;
    const condoAdminPassword = 'Password123!';
    console.log(`\n[3/9] Ensuring Condo Admin account exists: ${condoAdminEmail}...`);

    let condoAdminToken;
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: condoAdminEmail,
        password: condoAdminPassword,
      });
      condoAdminToken = loginRes.data.data.accessToken || loginRes.data.data.token;
      console.log('✅ Existing Condo Admin logged in successfully.');
    } catch (err) {
      console.log('Condo Admin does not exist yet. Registering via Super Admin...');
      const adminFan = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
      await axios.post(
        `${API_BASE}/admin/users`,
        {
          fullName: 'Abebe Condo Admin',
          email: condoAdminEmail,
          password: condoAdminPassword,
          phoneNumber: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
          fan: adminFan,
          role: 'condo_admin',
          condoId: testCondo.id,
          condoCode: testCondo.condoCode,
        },
        { headers: { Authorization: `Bearer ${superToken}` } }
      );
      console.log('Condo Admin created. Logging in...');
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: condoAdminEmail,
        password: condoAdminPassword,
      });
      condoAdminToken = loginRes.data.data.accessToken || loginRes.data.data.token;
      console.log('✅ Newly created Condo Admin logged in successfully.');
    }

    const condoHeaders = { Authorization: `Bearer ${condoAdminToken}` };

    // 4. Condo Admin fetches Condo Dashboard Stats (users, blocks, rooms)
    console.log('\n[4/9] Condo Admin fetching Dashboard data for their Condo...');
    const [usersRes, blocksRes, roomsRes] = await Promise.all([
      axios.get(`${API_BASE}/users/${testCondo.id}`, { headers: condoHeaders }),
      axios.get(`${API_BASE}/blocks/${testCondo.id}/blocks/admin`, { headers: condoHeaders }),
      axios.get(`${API_BASE}/rooms/${testCondo.id}`, { headers: condoHeaders }),
    ]);

    console.log(`✅ Dashboard stats loaded:`);
    console.log(`   - Users/Residents in Condo: ${usersRes.data.data?.length || 0}`);
    console.log(`   - Blocks in Condo: ${blocksRes.data.data?.length || 0}`);
    console.log(`   - Rooms in Condo: ${roomsRes.data.data?.length || 0}`);

    // 5. Condo Admin creates a Block
    const testBlockNo = `B-${Math.floor(100 + Math.random() * 900)}`;
    console.log(`\n[5/9] Condo Admin creating Block: ${testBlockNo}...`);
    const newBlockRes = await axios.post(
      `${API_BASE}/blocks`,
      {
        condoId: testCondo.id,
        blockNo: testBlockNo,
        noFloors: 4,
        noRooms: 16,
      },
      { headers: condoHeaders }
    );
    const createdBlock = newBlockRes.data.data;
    console.log(`✅ Block created successfully: ID: ${createdBlock.id}, BlockNo: ${createdBlock.blockNo}`);

    // 6. Condo Admin creates a Room in the Block
    const testRoomNo = `${testBlockNo}-R101`;
    console.log(`\n[6/9] Condo Admin creating Room: ${testRoomNo}...`);
    const newRoomRes = await axios.post(
      `${API_BASE}/rooms`,
      {
        condoId: testCondo.id,
        blockId: createdBlock.id,
        roomNo: testRoomNo,
        floorNo: 1,
        price: 4500,
        model: 'two_bedroom',
        status: 'free',
      },
      { headers: condoHeaders }
    );
    const createdRoom = newRoomRes.data.data;
    console.log(`✅ Room created successfully: ID: ${createdRoom.id}, RoomNo: ${createdRoom.roomNo}, Status: ${createdRoom.status}`);

    // 7. Condo Admin updates Room Status
    console.log(`\n[7/9] Condo Admin updating Room status to 'reserved'...`);
    const updateStatusRes = await axios.patch(
      `${API_BASE}/rooms/${testCondo.id}/${createdRoom.id}/status`,
      { status: 'reserved' },
      { headers: condoHeaders }
    );
    console.log(`✅ Room status updated: ${updateStatusRes.data.data.status}`);

    // 8. Condo Admin registers a Resident assigned to this Block and Room
    const residentEmail = `resident_${Date.now()}@test.com`;
    const residentFan = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
    console.log(`\n[8/9] Condo Admin registering new Resident: ${residentEmail}...`);
    const newResidentRes = await axios.post(
      `${API_BASE}/admin/users`,
      {
        fullName: 'Kebede Resident',
        email: residentEmail,
        password: 'Password123!',
        phoneNumber: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
        fan: residentFan,
        role: 'resident',
        condoId: testCondo.id,
        condoCode: testCondo.condoCode,
        block: testBlockNo,
        roomNo: testRoomNo,
      },
      { headers: condoHeaders }
    );
    const createdResident = newResidentRes.data.data.user || newResidentRes.data.data;
    console.log(`✅ Resident registered: ID: ${createdResident.id}, Block: ${createdResident.block}, Room: ${createdResident.roomNo}`);

    // 9. Verify Resident appears in Condo Admin's resident list
    console.log(`\n[9/9] Verifying Resident in Condo's user list...`);
    const verifyUsersRes = await axios.get(`${API_BASE}/users/${testCondo.id}`, { headers: condoHeaders });
    const foundResident = verifyUsersRes.data.data.find((u) => u.id === createdResident.id);
    if (foundResident) {
      console.log(`✅ Verification PASSED: Resident found in condo residents list.`);
      console.log(`   - Name: ${foundResident.fullName}`);
      console.log(`   - Email: ${foundResident.email}`);
      console.log(`   - Condo: ${foundResident.condoCode}`);
      console.log(`   - Unit: Block ${foundResident.block}, Room ${foundResident.roomNo}`);
    } else {
      throw new Error('Resident was registered but not found in condo list!');
    }

    console.log('\n======================================================');
    console.log('🎉 ALL CONDO ADMIN OPERATIONS VERIFIED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ E2E TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

runCondoAdminE2ETest();
