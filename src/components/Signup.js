 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/components/Signup.js b/src/components/Signup.js
index 564d6205437ce0211e202ddaf3ba929f4819f025..092a9a110f817c594b72a78854a3d1ac0b6b288a 100644
--- a/src/components/Signup.js
+++ b/src/components/Signup.js
@@ -1 +1,281 @@
-// src/components/Signup.js content placeholder
+import React, { useState } from 'react';
+
+const initialState = {
+  accountType: 'student',
+  firstName: '',
+  lastName: '',
+  email: '',
+  username: '',
+  password: '',
+  confirmPassword: '',
+  // student
+  gradeLevel: '',
+  age: '',
+  schoolName: '',
+  schoolDistrict: '',
+  desiredCareerPath: '',
+  avatarImage: null,
+  studentID: '',
+  // parent
+  childFirstName: '',
+  childGradeLevel: '',
+  relationshipToStudent: '',
+  numberOfChildren: '',
+  agreeToTerms: false,
+  agreeToDataPolicy: false,
+};
+
+function Signup() {
+  const [formData, setFormData] = useState(initialState);
+
+  const handleChange = (e) => {
+    const { name, value, type, checked, files } = e.target;
+    setFormData({
+      ...formData,
+      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
+    });
+  };
+
+  const handleSubmit = (e) => {
+    e.preventDefault();
+    console.log('Signup form data', formData);
+  };
+
+  return (
+    <form onSubmit={handleSubmit}>
+      <h2>Create an Account</h2>
+      <label>
+        Account Type:
+        <select name="accountType" value={formData.accountType} onChange={handleChange}>
+          <option value="student">Student</option>
+          <option value="parent">Parent</option>
+        </select>
+      </label>
+      <div>
+        <label>
+          First Name:
+          <input
+            type="text"
+            name="firstName"
+            value={formData.firstName}
+            onChange={handleChange}
+            required
+          />
+        </label>
+      </div>
+      <div>
+        <label>
+          Last Name:
+          <input
+            type="text"
+            name="lastName"
+            value={formData.lastName}
+            onChange={handleChange}
+            required
+          />
+        </label>
+      </div>
+      <div>
+        <label>
+          Email:
+          <input
+            type="email"
+            name="email"
+            value={formData.email}
+            onChange={handleChange}
+            required
+          />
+        </label>
+      </div>
+      <div>
+        <label>
+          Username:
+          <input
+            type="text"
+            name="username"
+            value={formData.username}
+            onChange={handleChange}
+            required
+          />
+        </label>
+      </div>
+      <div>
+        <label>
+          Password:
+          <input
+            type="password"
+            name="password"
+            value={formData.password}
+            onChange={handleChange}
+            required
+            minLength={8}
+          />
+        </label>
+      </div>
+      <div>
+        <label>
+          Confirm Password:
+          <input
+            type="password"
+            name="confirmPassword"
+            value={formData.confirmPassword}
+            onChange={handleChange}
+            required
+          />
+        </label>
+      </div>
+
+      {formData.accountType === 'student' && (
+        <>
+          <div>
+            <label>
+              Grade Level:
+              <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required>
+                <option value="">Select</option>
+                {Array.from({ length: 7 }, (_, i) => i + 6).map((grade) => (
+                  <option key={grade} value={`${grade}th`}>
+                    {grade}th
+                  </option>
+                ))}
+              </select>
+            </label>
+          </div>
+          <div>
+            <label>
+              Age:
+              <input
+                type="number"
+                name="age"
+                value={formData.age}
+                onChange={handleChange}
+                min={10}
+                max={18}
+                required
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              School Name:
+              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
+            </label>
+          </div>
+          <div>
+            <label>
+              School District:
+              <input
+                type="text"
+                name="schoolDistrict"
+                value={formData.schoolDistrict}
+                onChange={handleChange}
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              Desired Career Path:
+              <input
+                type="text"
+                name="desiredCareerPath"
+                value={formData.desiredCareerPath}
+                onChange={handleChange}
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              Avatar Image:
+              <input type="file" name="avatarImage" onChange={handleChange} />
+            </label>
+          </div>
+          <div>
+            <label>
+              Student ID:
+              <input type="text" name="studentID" value={formData.studentID} onChange={handleChange} />
+            </label>
+          </div>
+        </>
+      )}
+
+      {formData.accountType === 'parent' && (
+        <>
+          <div>
+            <label>
+              Child First Name:
+              <input
+                type="text"
+                name="childFirstName"
+                value={formData.childFirstName}
+                onChange={handleChange}
+                required
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              Child Grade Level:
+              <input
+                type="text"
+                name="childGradeLevel"
+                value={formData.childGradeLevel}
+                onChange={handleChange}
+                required
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              School Name:
+              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
+            </label>
+          </div>
+          <div>
+            <label>
+              Relationship to Student:
+              <input
+                type="text"
+                name="relationshipToStudent"
+                value={formData.relationshipToStudent}
+                onChange={handleChange}
+              />
+            </label>
+          </div>
+          <div>
+            <label>
+              Number of Children:
+              <input
+                type="number"
+                name="numberOfChildren"
+                value={formData.numberOfChildren}
+                onChange={handleChange}
+                min={1}
+              />
+            </label>
+          </div>
+        </>
+      )}
+
+      <div>
+        <label>
+          <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required />
+          I agree to the Terms of Service
+        </label>
+      </div>
+      <div>
+        <label>
+          <input
+            type="checkbox"
+            name="agreeToDataPolicy"
+            checked={formData.agreeToDataPolicy}
+            onChange={handleChange}
+            required
+          />
+          I agree to the Data Policy
+        </label>
+      </div>
+      <button type="submit">Sign Up</button>
+    </form>
+  );
+}
+
+export default Signup;
 
EOF
)
