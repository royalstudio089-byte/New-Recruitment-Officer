import { SecurityOfficer } from '../types';

export const CITY_OPTIONS = [
  'London',
  'Brighton',
  'Birmingham',
  'Glasgow',
  'Manchester',
  'Sunderland',
  'Cardiff',
  'Swindon',
  'Scotland',
  'Watford',
  'Ilford',
  'Barrats',
  'Peterborough',
  'Bristol'
] as const;

export type CityOption = typeof CITY_OPTIONS[number];

export const INITIAL_OFFICERS: SecurityOfficer[] = [
  {
    id: 'off-1',
    srNo: 1,
    name: 'Muhammad Tariq Khan',
    city: 'London',
    phoneNumber: '0300-4521890',
    status: 'Full timer',
    car: 'Yes',
    stage: 'Active',
    notes: 'Experienced senior patrol guard with valid license.'
  },
  {
    id: 'off-2',
    srNo: 2,
    name: 'Usman Ali Raza',
    city: 'Birmingham',
    phoneNumber: '0321-8843219',
    status: 'Student',
    car: 'No',
    stage: 'Interview Scheduled',
    notes: 'Available for evening & weekend night shifts.'
  },
  {
    id: 'off-3',
    srNo: 3,
    name: 'Zahid Mahmood',
    city: 'Manchester',
    phoneNumber: '0333-5129087',
    status: 'E-Visa',
    car: 'Yes',
    stage: 'Selected',
    notes: 'E-Visa certified, ready for rapid corporate site deployment.'
  },
  {
    id: 'off-4',
    srNo: 4,
    name: 'Bilal Ahmad Farooqi',
    city: 'Glasgow',
    phoneNumber: '0345-6712345',
    status: 'Full timer',
    car: 'Yes',
    stage: 'Active',
    notes: 'Clean background check verified, own vehicle.'
  },
  {
    id: 'off-5',
    srNo: 5,
    name: 'Hamza Shabbir',
    city: 'Bristol',
    phoneNumber: '0302-7654321',
    status: 'Student',
    car: 'No',
    stage: 'Interviewed',
    notes: 'University student, flexible schedule after 4 PM.'
  },
  {
    id: 'off-6',
    srNo: 6,
    name: 'Asim Javed Butt',
    city: 'Watford',
    phoneNumber: '0312-9988776',
    status: 'E-Visa',
    car: 'Yes',
    stage: 'Selected',
    notes: 'International verification cleared, SIA credentials verified.'
  },
  {
    id: 'off-7',
    srNo: 7,
    name: 'Kashif Mehmood Sheikh',
    city: 'Brighton',
    phoneNumber: '0308-3344556',
    status: 'Full timer',
    car: 'No',
    stage: 'Active',
    notes: 'Ex-forces background, expert in access control monitoring.'
  },
  {
    id: 'off-8',
    srNo: 8,
    name: 'Shahzaib Naveed',
    city: 'Cardiff',
    phoneNumber: '0301-4433221',
    status: 'Student',
    car: 'Yes',
    stage: 'New Applicant',
    notes: 'Applied through online portal, documents pending review.'
  },
  {
    id: 'off-9',
    srNo: 9,
    name: 'Rashid Minhas Gondal',
    city: 'Ilford',
    phoneNumber: '0322-1122334',
    status: 'E-Visa',
    car: 'No',
    stage: 'On Hold',
    notes: 'Visa extension document under validation.'
  },
  {
    id: 'off-10',
    srNo: 10,
    name: 'Waqas Ashraf Malik',
    city: 'Swindon',
    phoneNumber: '0346-8877665',
    status: 'Full timer',
    car: 'Yes',
    stage: 'Active',
    notes: 'Equipped with vehicle, ready for mobile patrol units.'
  }
];

export const STATUS_OPTIONS = [
  'Student',
  'Full timer',
  'E-Visa',
  'New Applicant',
  'Interview Scheduled',
  'Interviewed',
  'Selected',
  'Rejected',
  'On Hold',
  'Active',
  'Inactive'
] as const;

export const CAR_OPTIONS = ['Yes', 'No'] as const;
