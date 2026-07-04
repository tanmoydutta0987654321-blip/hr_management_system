from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from db import execute_query
from config import Config
import os

profile_bp = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.route('/profile')
@profile_bp.route('/profile_view')
@profile_bp.route('/profile_view.html')
def profile_view():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    user_id = session['user_id']
    emp_id = session.get('employee_id')

    user = execute_query(
        "SELECT id, employee_id, email, role, created_at FROM users WHERE id = %s",
        (user_id,), fetch_one=True
    )
    employee = execute_query(
        "SELECT * FROM employees WHERE user_id = %s",
        (user_id,), fetch_one=True
    )
    salary = execute_query(
        "SELECT basic_salary, bonus, deduction FROM salary WHERE employee_id = %s",
        (emp_id,), fetch_one=True
    )
    documents = execute_query(
        "SELECT id, document_name, file_url, uploaded_at FROM documents WHERE employee_id = %s ORDER BY uploaded_at DESC",
        (emp_id,), fetch_all=True
    )
    departments = execute_query(
        """SELECT d.name FROM departments d
           JOIN employee_department ed ON d.id = ed.department_id
           WHERE ed.employee_id = %s""",
        (emp_id,), fetch_all=True
    )

    return render_template('profile_view.html',
        user=user,
        employee=employee,
        salary=salary or {'basic_salary': 0, 'bonus': 0, 'deduction': 0},
        documents=documents or [],
        departments=departments or []
    )


@profile_bp.route('/employee_profile')
@profile_bp.route('/employee_profile.html')
def employee_profile():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    user_id = session['user_id']
    emp_id = session.get('employee_id')

    user = execute_query(
        "SELECT id, employee_id, email, role, created_at FROM users WHERE id = %s",
        (user_id,), fetch_one=True
    )
    employee = execute_query(
        "SELECT * FROM employees WHERE user_id = %s",
        (user_id,), fetch_one=True
    )
    salary = execute_query(
        "SELECT basic_salary, bonus, deduction FROM salary WHERE employee_id = %s",
        (emp_id,), fetch_one=True
    )
    payroll_records = execute_query(
        "SELECT pay_month, total_salary, payment_status, created_at FROM payroll WHERE employee_id = %s ORDER BY created_at DESC",
        (emp_id,), fetch_all=True
    )

    return render_template('employee_profile.html',
        user=user,
        employee=employee,
        salary=salary or {'basic_salary': 0, 'bonus': 0, 'deduction': 0},
        payroll_records=payroll_records or []
    )


@profile_bp.route('/profile_management')
@profile_bp.route('/profile_management.html')
def profile_management():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    role = session.get('role')

    if role == 'hr_manager':
        # HR: list all employees
        employees = execute_query(
            """SELECT e.id, e.first_name, e.last_name, e.gender, e.phone, e.date_of_birth, e.address,
                      u.employee_id as emp_code, u.email, u.role,
                      GROUP_CONCAT(d.name SEPARATOR ', ') as departments
               FROM employees e
               JOIN users u ON e.user_id = u.id
               LEFT JOIN employee_department ed ON e.id = ed.employee_id
               LEFT JOIN departments d ON ed.department_id = d.id
               GROUP BY e.id
               ORDER BY e.first_name""",
            fetch_all=True
        )
        all_departments = execute_query("SELECT id, name FROM departments ORDER BY name", fetch_all=True)
        return render_template('profile_management.html',
            employees=employees or [],
            all_departments=all_departments or [],
            is_hr=True
        )
    else:
        return redirect(url_for('profile.profile_view'))


@profile_bp.route('/profile/manage/<int:emp_id>')
def manage_employee(emp_id):
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return redirect(url_for('auth.signin'))

    employee = execute_query(
        """SELECT e.*, u.employee_id as emp_code, u.email, u.role
           FROM employees e JOIN users u ON e.user_id = u.id
           WHERE e.id = %s""",
        (emp_id,), fetch_one=True
    )
    if not employee:
        return redirect(url_for('profile.profile_management'))

    salary = execute_query(
        "SELECT basic_salary, bonus, deduction FROM salary WHERE employee_id = %s",
        (emp_id,), fetch_one=True
    )
    documents = execute_query(
        "SELECT id, document_name, file_url, uploaded_at FROM documents WHERE employee_id = %s ORDER BY uploaded_at DESC",
        (emp_id,), fetch_all=True
    )
    departments = execute_query(
        """SELECT d.id, d.name FROM departments d
           JOIN employee_department ed ON d.id = ed.department_id
           WHERE ed.employee_id = %s""",
        (emp_id,), fetch_all=True
    )
    all_departments = execute_query("SELECT id, name FROM departments ORDER BY name", fetch_all=True)

    return render_template('profile_view.html',
        user={'employee_id': employee['emp_code'], 'email': employee['email'], 'role': employee['role']},
        employee=employee,
        salary=salary or {'basic_salary': 0, 'bonus': 0, 'deduction': 0},
        documents=documents or [],
        departments=departments or [],
        all_departments=all_departments or [],
        is_hr_editing=True,
        target_emp_id=emp_id
    )


# ======================== API Endpoints ========================

@profile_bp.route('/api/profile/update', methods=['POST'])
def update_profile():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() if request.is_json else request.form
    target_emp_id = data.get('target_emp_id')

    # Determine which employee to update
    if target_emp_id and session.get('role') == 'hr_manager':
        emp_id = int(target_emp_id)
    else:
        emp_id = session.get('employee_id')

    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    gender = data.get('gender', '').strip()
    phone = data.get('phone', '').strip()
    date_of_birth = data.get('date_of_birth', '').strip() or None
    address = data.get('address', '').strip()

    if not first_name or not last_name:
        return jsonify({'error': 'First name and last name are required'}), 400

    result = execute_query(
        """UPDATE employees SET first_name = %s, last_name = %s, gender = %s,
           phone = %s, date_of_birth = %s, address = %s WHERE id = %s""",
        (first_name, last_name, gender, phone, date_of_birth, address, emp_id), commit=True
    )

    if result is None:
        return jsonify({'error': 'Update failed'}), 500

    # Update session if it's the current user's own profile
    if emp_id == session.get('employee_id'):
        session['first_name'] = first_name
        session['last_name'] = last_name

    return jsonify({'success': True, 'message': 'Profile updated successfully'})


@profile_bp.route('/api/profile/password', methods=['POST'])
def change_password():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() if request.is_json else request.form
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'All password fields are required'}), 400
    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    if new_password != confirm_password:
        return jsonify({'error': 'New passwords do not match'}), 400

    user = execute_query(
        "SELECT password FROM users WHERE id = %s",
        (session['user_id'],), fetch_one=True
    )

    if not check_password_hash(user['password'], current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400

    hashed = generate_password_hash(new_password)
    execute_query(
        "UPDATE users SET password = %s WHERE id = %s",
        (hashed, session['user_id']), commit=True
    )

    return jsonify({'success': True, 'message': 'Password changed successfully'})


@profile_bp.route('/api/profile/department', methods=['POST'])
def update_department():
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() if request.is_json else request.form
    emp_id = data.get('employee_id')
    department_id = data.get('department_id')
    action = data.get('action', 'add')

    if not emp_id or not department_id:
        return jsonify({'error': 'Employee ID and Department ID are required'}), 400

    if action == 'add':
        execute_query(
            "INSERT IGNORE INTO employee_department (employee_id, department_id) VALUES (%s, %s)",
            (emp_id, department_id), commit=True
        )
    elif action == 'remove':
        execute_query(
            "DELETE FROM employee_department WHERE employee_id = %s AND department_id = %s",
            (emp_id, department_id), commit=True
        )

    return jsonify({'success': True, 'message': f'Department {"added" if action == "add" else "removed"} successfully'})


@profile_bp.route('/api/profile/upload-document', methods=['POST'])
def upload_document():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    target_emp_id = request.form.get('target_emp_id')
    if target_emp_id and session.get('role') == 'hr_manager':
        emp_id = int(target_emp_id)
    else:
        emp_id = session.get('employee_id')

    if 'document' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['document']
    doc_name = request.form.get('document_name', file.filename)

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Allowed: pdf, png, jpg, jpeg, doc, docx'}), 400

    # Ensure upload directory exists
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(f"{emp_id}_{file.filename}")
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)

    file_url = f"/static/uploads/{filename}"
    execute_query(
        "INSERT INTO documents (employee_id, document_name, file_url) VALUES (%s, %s, %s)",
        (emp_id, doc_name, file_url), commit=True
    )

    return jsonify({'success': True, 'message': 'Document uploaded successfully', 'file_url': file_url})
