'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: '',
    footerText: '',
    contactEmail: '',
    phone: '',
    address: '',
    logoUrl: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  
  const backendUrl = 'http://localhost:3001';

  // Create object URL when logoFile changes
  useEffect(() => {
    if (logoFile) {
      const objectUrl = URL.createObjectURL(logoFile);
      setLogoPreviewUrl(objectUrl);

      // Cleanup: revoke object URL when logoFile or component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
        setLogoPreviewUrl(null);
      };
    }
  }, [logoFile]);

  useEffect(() => {
    fetch('http://localhost:3001/api/settings')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched settings (useEffect):', data); 
        const normalizedSettings = {
          ...data,
          socialLinks: {
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || ''
          }
        };
        setSettings(normalizedSettings);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const platform = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platform]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const saveSettings = async () => {
    const formData = new FormData();
    formData.append('siteName', settings.siteName);
    formData.append('footerText', settings.footerText);
    formData.append('contactEmail', settings.contactEmail);
    formData.append('phone', settings.phone);
    formData.append('address', settings.address);
    formData.append('facebook', settings.socialLinks.facebook);
    formData.append('instagram', settings.socialLinks.instagram);
    formData.append('twitter', settings.socialLinks.twitter);
    formData.append('linkedin', settings.socialLinks.linkedin);

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    const res = await fetch('http://localhost:3001/api/settings', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
  const updated = await res.json();
  const normalizedUpdated = {
    ...updated,
    socialLinks: {
      facebook: updated.facebook || '',
      instagram: updated.instagram || '',
      twitter: updated.twitter || '',
      linkedin: updated.linkedin || ''
    }
  };
  setSettings(normalizedUpdated);
  setLogoFile(null);
  setLogoPreviewUrl(null);
}

  };

  // Use preview URL if exists, else backend URL or fallback image
  const logoSrc = logoPreviewUrl
    ? logoPreviewUrl
    : settings.logoUrl
      ? `${backendUrl}${settings.logoUrl}?t=${Date.now()}`
      : '/ezza.jpg';
console.log('Current logoSrc:', logoSrc);
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paramètres du site</h1>

      {/* Site name */}
      <input name="siteName" value={settings.siteName} onChange={handleChange} placeholder="Nom du site" className="w-full border p-2 rounded mb-2" />

      {/* Footer text */}
      <input name="footerText" value={settings.footerText} onChange={handleChange} placeholder="Texte du pied de page" className="w-full border p-2 rounded mb-2" />

      {/* Logo upload */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {logoSrc && <img src={logoSrc} alt="Current logo" className="mt-2 h-16" />}
      </div>

      {/* Contact email */}
      <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded mb-2" />

      {/* Phone */}
      <input name="phone" value={settings.phone} onChange={handleChange} placeholder="Téléphone" className="w-full border p-2 rounded mb-2" />

      {/* Address */}
      <input name="address" value={settings.address} onChange={handleChange} placeholder="Adresse" className="w-full border p-2 rounded mb-2" />

      {/* Social links */}
      <input name="socialLinks.facebook" value={settings.socialLinks.facebook} onChange={handleChange} placeholder="Lien Facebook" className="w-full border p-2 rounded mb-2" />
      <input name="socialLinks.instagram" value={settings.socialLinks.instagram} onChange={handleChange} placeholder="Lien Instagram" className="w-full border p-2 rounded mb-2" />
      <input name="socialLinks.twitter" value={settings.socialLinks.twitter} onChange={handleChange} placeholder="Lien Twitter" className="w-full border p-2 rounded mb-2" />
      <input name="socialLinks.linkedin" value={settings.socialLinks.linkedin} onChange={handleChange} placeholder="Lien LinkedIn" className="w-full border p-2 rounded mb-2" />

      <button onClick={saveSettings} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Save Settings</button>
      <button onClick={() => {
  fetch('http://localhost:3001/api/settings')
    .then(res => res.json())
    .then(data => {
      console.log('Fetched settings (refresh button):', data);
      const normalizedSettings = {
        ...data,
        socialLinks: {
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
          linkedin: data.linkedin || ''
        }
      };
      setSettings(normalizedSettings);
    });
}} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
  Refresh 
</button>



    </div>
  );
}
