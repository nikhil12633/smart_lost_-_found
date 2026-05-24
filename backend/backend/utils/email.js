const emailJsUrl = 'https://api.emailjs.com/api/v1.0/email/send';

const formatLostItemDetails = (item) => {
  return [
    `Item: ${item.title || 'N/A'}`,
    `PNR: ${item.pnr || 'N/A'}`,
    `Owner: ${item.ownerName || 'Passenger'}`,
    `Contact: ${item.contact || item.ownerPhone || 'N/A'}`,
    `Train: ${item.trainNumber || 'N/A'}`,
    `Last Location: ${item.locationLost || 'N/A'}`,
    `Return Preference: ${item.collectionPreference === 'delivery' ? 'Delivery' : 'Station pickup'}`,
    `Delivery/Pickup Details: ${item.deliveryAddress || 'N/A'}`,
    `Staff Note: ${item.verificationNotes || 'N/A'}`,
  ].join('\n');
};

const sendLostItemStatusEmail = async ({ item, foundItem, status }) => {
  if (!item?.ownerEmail) return { skipped: true, reason: 'Missing owner email' };

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const userId = process.env.EMAILJS_USER_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  const effectiveUserId = publicKey || userId;
  const isFound = status === 'found';
  const subject = isFound
    ? `Your lost item was found: ${item.title}`
    : `Update on your lost item report: ${item.title}`;

  const foundDetails = foundItem
    ? [
        '',
        'Found Item Details:',
        `Found Location: ${foundItem.locationFound || 'N/A'}`,
        `Station: ${foundItem.station || 'N/A'}`,
        `Train: ${foundItem.trainNumber || 'N/A'}`,
        `Description: ${foundItem.description || 'N/A'}`,
      ].join('\n')
    : '';

  const message = [
    isFound
      ? 'Good news. Station staff has marked your lost item as found.'
      : 'Station staff checked your report and has marked the item as not found yet.',
    '',
    'Lost Report Details:',
    formatLostItemDetails(item),
    foundDetails,
    '',
    item.collectionPreference === 'delivery'
      ? 'The staff will use your delivery address for return coordination.'
      : 'Please wait for staff confirmation before coming to collect the item at the station.',
  ].join('\n');

  const templateParams = {
    to_email: item.ownerEmail,
    to_name: item.ownerName || 'Passenger',
    subject,
    message,
    item_name: item.title || 'Lost item',
    pnr: item.pnr || '',
    status: isFound ? 'Found' : 'Not found yet',
    owner_name: item.ownerName || 'Passenger',
    contact: item.contact || item.ownerPhone || '',
    train_number: item.trainNumber || '',
    last_location: item.locationLost || '',
    delivery_address: item.deliveryAddress || '',
    collection_preference: item.collectionPreference === 'delivery' ? 'Delivery' : 'Station pickup',
    found_location: foundItem?.locationFound || '',
    found_station: foundItem?.station || '',
    found_description: foundItem?.description || '',
    item_image_url: item.imageUrl || '',
    found_image_url: foundItem?.imageUrl || '',
    found_image_html: foundItem?.imageUrl ? `<img src="${foundItem.imageUrl}" alt="Found item" style="max-width:100%;height:auto;" />` : '',
  };

  if (!serviceId || !templateId || !effectiveUserId) {
    console.error('EmailJS not sent. Configure EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY or EMAILJS_USER_ID.');
    console.error({ to: item.ownerEmail, subject, templateParams });
    return { skipped: true, reason: 'EmailJS not configured' };
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    template_params: templateParams,
    user_id: effectiveUserId,
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  const authMethods = [effectiveUserId ? 'user_id' : null, privateKey ? 'accessToken' : null].filter(Boolean);
  console.log('Sending EmailJS message', { to: item.ownerEmail, subject, authMethods: authMethods.join(', ') });
  const response = await fetch(emailJsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    const authMethods = [];
    if (privateKey) authMethods.push('accessToken');
    if (effectiveUserId) authMethods.push('user_id');
    console.error('EmailJS payload auth methods:', authMethods.join(', '));
    console.error(`EmailJS failed: ${response.status} ${body}`);
    if (response.status === 403 && body.includes('non-browser environments')) {
      throw new Error('EmailJS API access from non-browser environments is disabled. Enable it in the EmailJS dashboard under Account > Security.');
    }
    throw new Error(`EmailJS failed: ${response.status} ${body}`);
  }

  return { sent: true };
};

module.exports = {
  sendLostItemStatusEmail,
};
