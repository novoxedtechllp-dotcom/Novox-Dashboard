export const employeeStatusFromApi = (status) => {
  if (status === 'ON_LEAVE') return 'On Leave';
  if (status === 'TERMINATED') return 'Terminated';
  return 'Active';
};

export const employeeDepartmentFromApi = (department) => {
  if (department === 'DEVELOPMENT') return 'Development';
  if (department === 'HR') return 'HR';
  return department ? department.charAt(0) + department.slice(1).toLowerCase() : 'Staff';
};

export const getInitials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0][0].toUpperCase();
};

export const mapEmployeeFromApi = (d) => {
  const id = d.id || d._id;
  const localCourseIds = localStorage.getItem(`employee_courses_${id}`);
  
  return {
    id,
    eid: d.employee_code || `EMP-${String(id).slice(0, 4)}`,
    name: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
    department: employeeDepartmentFromApi(d.employee_roles?.role_name),
    designation: d.designation || '',
    phone: d.phone,
    status: employeeStatusFromApi(d.status),
    joinDate: d.joining_date ? new Date(d.joining_date).toLocaleDateString() : '',
    avatar: d.avatar_url || null,
    email: d.users?.email || '',
    systemRole: d.users?.role || 'EMPLOYEE',
    courseIds: localCourseIds ? JSON.parse(localCourseIds) : (d.course_instructors?.map(ci => ci.course_id || ci.courses?.id) || []),
    custom_permissions: d.custom_permissions || null
  };
};

export const mapCourseFromApi = (d) => {
  const instructorProfile = d.course_instructors?.[0]?.employee_profiles;
  const mentorName = instructorProfile
    ? `${instructorProfile.first_name || ''} ${instructorProfile.last_name || ''}`.trim()
    : 'Unassigned';

  return {
    ...d,
    title: d.name || d.title || '',
    category: d.track || d.category || 'DEVELOPMENT',
    mentorId: instructorProfile?.id || '',
    mentorName,
    mentorInitials: getInitials(mentorName),
    price: d.total_fee ? `₹${d.total_fee}` : (d.price || '₹0.00'),
    imgUrl: d.imgUrl || null
  };
};
