import React, { useRef, useState } from "react";
import {
  findNodeHandle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { IconSymbol } from "./IconSymbol";

interface MenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onEdit, onDelete }) => {
  const [visible, setVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const triggerRef = useRef<any>(null);

  const handleOpen = () => {
    if (triggerRef.current) {
      const node = findNodeHandle(triggerRef.current);
      if (node) {
        UIManager.measureInWindow(node, (x, y, width, height) => {
          // Position menu below and right-aligned to the trigger
          setMenuPosition({ x: x + width - 120, y: y + height + 4 });
          setVisible(true);
        });
      } else {
        setVisible(true);
      }
    } else {
      setVisible(true);
    }
  };

  const handleClose = () => setVisible(false);

  const handleEdit = () => {
    handleClose();
    onEdit();
  };

  const handleDelete = () => {
    handleClose();
    onDelete();
  };

  return (
    <View>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleOpen}
        style={styles.trigger}
        hitSlop={8}
      >
        <IconSymbol name="ellipsis" size={22} color="#888" />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View
            style={[
              styles.menu,
              {
                position: "absolute",
                left: menuPosition.x,
                top: menuPosition.y,
              },
            ]}
          >
            <Pressable style={styles.menuItem} onPress={handleEdit}>
              <Text style={styles.menuText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuText, { color: "#dc3545" }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
