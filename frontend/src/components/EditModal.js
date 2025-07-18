import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DateTime } from 'luxon';
import { motion } from 'framer-motion';

const EditModal = ({ report, isOpen, onClose, onUpdate }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [absence, setAbsence] = useState(false);
  const [annualLeave, setAnnualLeave] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (report) {
      setCheckIn(report.checkIn || '');
      setCheckOut(report.checkOut || '');
      setAbsence(report.absence === 'نعم');
      setAnnualLeave(report.annualLeave === 'نعم');
      setError('');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if ((checkIn && !timeRegex.test(checkIn)) || (checkOut && !timeRegex.test(checkOut))) {
      setError('تنسيق الوقت غير صالح، يجب أن يكون HH:mm:ss');
      return;
    }

    if (absence && annualLeave) {
      setError('لا يمكن تحديد الغياب والإجازة السنوية معًا');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/fingerprints/${report._id}`,
        {
          code: report.code,
          date: report.date,
          checkIn: checkIn || null,
          checkOut: checkOut || null,
          absence,
          annualLeave,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(response.data.report);
      onClose();
    } catch (err) {
      console.error('Error saving report:', err);
      setError(err.response?.data?.error || 'خطأ في حفظ التعديلات');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-right">تعديل السجل</h2>
        {error && <p className="text-red-500 text-right mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">كود الموظف</label>
            <input
              type="text"
              value={report.code}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-right"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">تاريخ الحضور</label>
            <input
              type="text"
              value={report.date}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-right"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">توقيت الحضور</label>
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-right"
              step="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">توقيت الانصراف</label>
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-right"
              step="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">الغياب</label>
            <input
              type="checkbox"
              checked={absence}
              onChange={(e) => setAbsence(e.target.checked)}
              className="mr-2"
            />
            <span>نعم</span>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2 text-right">إجازة سنوية</label>
            <input
              type="checkbox"
              checked={annualLeave}
              onChange={(e) => setAnnualLeave(e.target.checked)}
              className="mr-2"
            />
            <span>نعم</span>
          </div>
          <div className="flex justify-end gap-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
            >
              حفظ
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              إلغاء
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditModal;

