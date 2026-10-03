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
  'Bristol',
  'Gateshead',
  'Barnkingside London',
  'Tooting, London',
  'Southall',
  'Slough',
  'Telford'
] as const;

export type CityOption = typeof CITY_OPTIONS[number];

export const INITIAL_OFFICERS: SecurityOfficer[] = [
  {
    id: 'off-1',
    srNo: 1,
    name: 'Nitin',
    city: 'Glasgow',
    phoneNumber: '07436232695',
    status: 'Full timer',
    car: 'Yes',
    dogHandler: 'No',
    easyToMove: 'Yes',
    stage: 'Active',
    notes: 'Glasgow based, verified credentials with vehicle. Flexible to relocate/move.'
  },
  {
    id: 'off-2',
    srNo: 2,
    name: 'Muhammad Zain Nasir',
    city: 'Birmingham',
    phoneNumber: '07770577295',
    status: 'Full timer',
    car: 'Yes',
    dogHandler: 'Yes',
    easyToMove: 'Yes',
    stage: 'Active',
    notes: 'Birmingham deployment ready, own car, certified K9 dog handler. Willing to travel.'
  },
  {
    id: 'off-3',
    srNo: 3,
    name: 'Nabeel Ahmed',
    city: 'Gateshead',
    phoneNumber: '447466151419',
    status: 'Full timer',
    car: 'Yes',
    dogHandler: 'No',
    easyToMove: 'No',
    stage: 'Active',
    notes: 'Gateshead / North East patrol unit, vehicle available.'
  },
  {
    id: 'off-4',
    srNo: 4,
    name: 'Saqib Ali Raza',
    city: 'London',
    phoneNumber: '447469514940',
    status: 'Full timer',
    car: 'No',
    dogHandler: 'No',
    easyToMove: 'No',
    stage: 'Active',
    notes: 'Central London static site officer, transit accessible.'
  },
  {
    id: 'off-5',
    srNo: 5,
    name: 'Arslan Ilyas',
    city: 'London',
    phoneNumber: '07916177815',
    status: 'Full timer',
    car: 'Yes',
    dogHandler: 'Yes',
    easyToMove: 'Yes',
    stage: 'Active',
    notes: 'London mobile response patrol guard with GP dog handling experience. Mobile deployment.'
  },
  {
    id: 'off-6',
    srNo: 6,
    name: 'Adnan Babar',
    city: 'Barnkingside London',
    phoneNumber: '07413600096',
    status: 'Full timer',
    car: 'No',
    dogHandler: 'No',
    easyToMove: 'No',
    stage: 'Active',
    notes: 'East London / Barkingside security coverage.'
  },
  {
    id: 'off-7',
    srNo: 7,
    name: 'Muhammad Omar',
    city: 'Tooting, London',
    phoneNumber: '07436483942',
    status: 'Full timer',
    car: 'No',
    dogHandler: 'No',
    easyToMove: 'No',
    stage: 'Active',
    notes: 'South London / Tooting access control specialist.'
  },
  {
    id: 'off-8',
    srNo: 8,
    name: 'Nadeem Aslam',
    city: 'Birmingham',
    phoneNumber: '447404232654',
    status: 'Full timer',
    car: 'Yes',
    dogHandler: 'No',
    easyToMove: 'Yes',
    stage: 'Active',
    notes: 'Birmingham mobile supervision and patrol. Readily available to move between sites.'
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
export const DOG_HANDLER_OPTIONS = ['Yes', 'No'] as const;
export const EASY_TO_MOVE_OPTIONS = ['Yes', 'No'] as const;
